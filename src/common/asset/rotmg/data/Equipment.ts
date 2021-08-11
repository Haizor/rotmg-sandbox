import Activate from "./activate/Activate";
import Item from "./Item";
import { Stats } from "./Stats";
import RotMGObject from "./XMLObject";

export type Tier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | "UT" | "ST";

export enum SlotType {
	None,
	Sword,
	Dagger,
	Bow,
	Tome,
	Shield,
	LeatherArmor,
	HeavyArmor,
	Wand,
	Ring,
	Potion,
	Spell,
	Seal,
	Cloak,
	RobeArmor,
	Quiver,
	Helm,
	Staff,
	Poison,
	Skull,
	Trap,
	Orb,
	Prism,
	Scepter,
	Katana,
	Star,

	Wakizashi = 27,
	Lute,
	Mace,
}

export enum BagType {
	None,
	PinkBag,
	PurpleBag,
	CyanBag = 4,
	BlueBag,
	WhiteBag,
	YellowBag,
	OrangeBag,
	RedBag
}

export default class Equipment extends RotMGObject {
	slotType: SlotType = SlotType.None;
	tier: Tier = 0;
	bagType: BagType = BagType.None;
	rateOfFire: number = 1;
	arcGap: number = 15;
	numProjectiles: number = 1;
	stats: Stats = new Stats();

	consumable: boolean = false;
	potion: boolean = false;
	activates: Activate[] = [];
	
	mpCost: number = 0;
	cooldown: number = 0.5;

	displayId?: string;
	description?: string;

	getDisplayName(): string {
		return this.displayId || this.id;
	}

	createInstance(): Item {
		return new Item(this);
	}

	getSerializedObject() {
		return {
			...super.getSerializedObject(),
			DisplayId: this.displayId,
			Description: this.description,
			SlotType: this.slotType,
			Tier: (this.tier === "UT" || this.tier === "ST" ? undefined : this.tier),
			BagType: this.bagType,
			RateOfFire: this.rateOfFire === 1 ? undefined : this.rateOfFire,
			ArcGap: this.arcGap === 15 ? undefined : this.arcGap,
			NumProjectiles: this.numProjectiles === 1 ? undefined : this.numProjectiles,
			...this.stats.serialize(),
		}
	}
}