import Player from "../game/rotmg/data/Player";
import { Stats } from "../game/rotmg/data/Stats";
import { EventEmitter, EventResult } from "./EventEmitter";
import PlayerInventory from "./PlayerInventory";

export default class PlayerManager extends EventEmitter {
	class: Player | undefined;
	inventory: PlayerInventory;
	baseStats: Stats = new Stats();
	hp: number = 100;
	mp: number = 100;
	constructor() {
		super();
		this.inventory = new PlayerInventory();
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