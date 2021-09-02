import AssetManager from "./asset/normal/AssetManager";
import Player from "./asset/rotmg/data/Player";
import { Stats } from "./asset/rotmg/data/Stats";
import { EventEmitter, EventResult } from "./EventEmitter";
import PlayerInventory from "./PlayerInventory";

export default class PlayerManager extends EventEmitter {
	class: Player | undefined;
	inventory: PlayerInventory;
	baseStats: Stats = new Stats();
	assetManager: AssetManager;

	private _inCombat: boolean = false;

	constructor(assetManager: AssetManager) {
		super();
		this.assetManager = assetManager;
		this.inventory = new PlayerInventory(assetManager);
		this.inventory.on("change", this.onInventoryChange);
	}

	onInventoryChange = () => {
		this.trigger("updateStats");
		return EventResult.Pass;
	}

	setClass(clazz: Player | undefined) {
		if (clazz !== undefined) {
			this.class = clazz;
			this.inventory.setClass(clazz);
			this.baseStats = clazz.stats;
			this.trigger("updateStats");
		}
	}

	setInCombat(status: boolean) {
		this._inCombat = status;
		this.onInCombatChange(status);
	}

	onHealthChange(hp: number, maxHp: number) {
		this.trigger("hp", hp, maxHp)
	}

	onManaChange(mp: number, maxMp: number) {
		this.trigger("mp", mp, maxMp);
	}

	onInCombatChange(combatStatus: boolean) {
		this.trigger("combat", combatStatus)
		this.trigger("combatColor", combatStatus ? "#FFFF00" : undefined);
	}

	addStats(stats: Stats) {
		if (this.class !== undefined) {
			this.baseStats = Stats.min(this.baseStats.add(stats), this.class.maxStats);
		} else {
			this.baseStats = this.baseStats.add(stats);
		}
		this.trigger("updateStats");
	}

	getStats(): Stats {
		let stats = this.baseStats;
		for (let i = 0; i < 4; i++) {
			const item = this.inventory.getItem(i);
			if (item !== undefined) {
				stats = stats.add(item.getStats())
			}
		}
		return stats;
	}
}