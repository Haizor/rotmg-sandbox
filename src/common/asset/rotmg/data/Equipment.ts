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
	activates: any[] = [];
	
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
}