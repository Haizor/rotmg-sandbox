import { Serialize, XMLBoolean, XMLNoDefault } from "common/asset/normal/Serializable";
import Activate, { ActivateSerializer } from "./activate/Activate";
import Item from "./Item";
import StatsSerializer, { Stats } from "./Stats";
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

const WeaponTypes = [
	SlotType.Staff,
	SlotType.Sword,
	SlotType.Bow,
	SlotType.Wand,
	SlotType.Dagger,
	SlotType.Katana
]

const AbilityTypes = [
	SlotType.Cloak,
	SlotType.Helm,
	SlotType.Lute,
	SlotType.Mace,
	SlotType.Orb,
	SlotType.Poison,
	SlotType.Prism,
	SlotType.Quiver,
	SlotType.Scepter,
	SlotType.Seal,
	SlotType.Shield,
	SlotType.Skull,
	SlotType.Spell,
	SlotType.Star,
	SlotType.Tome,
	SlotType.Trap,
	SlotType.Wakizashi,
]

export enum BagType {
	BrownBag,
	PinkBag,
	PurpleBag,
	CyanBag = 4,
	BlueBag,
	WhiteBag,
	YellowBag,
	OrangeBag,
	RedBag
}

export function TierSerializer(value: Tier) {
	if (value === "UT" || value === "ST") return;
	return value;
}
export default class Equipment extends RotMGObject {
	@Serialize("SlotType", (value: SlotType) => SlotType[value])
	slotType: SlotType = SlotType.None;
	@Serialize("Tier", TierSerializer)
	tier: Tier = 0;
	@Serialize("BagType", (value: BagType) => BagType[value])
	bagType: BagType = BagType.BrownBag;
	@Serialize("RateOfFire", XMLNoDefault(1))
	rateOfFire: number = 1;
	@Serialize("ArcGap", XMLNoDefault(15))
	arcGap: number = 15;
	@Serialize("NumProjectiles", XMLNoDefault(1))
	numProjectiles: number = 1;
	@Serialize("ActivateOnEquip", StatsSerializer, true)
	stats: Stats = new Stats();

	@Serialize("Consumable", XMLBoolean)
	consumable: boolean = false;
	@Serialize("Potion", XMLBoolean)
	potion: boolean = false;
	@Serialize("Soulbound", XMLBoolean)
	soulbound: boolean = false;
	@Serialize("Activate", ActivateSerializer)
	activates: Activate[] = [];
	@Serialize("feedPower")
	feedPower?: number;
	
	@Serialize("MpCost", XMLNoDefault(0))
	mpCost: number = 0;
	@Serialize("Cooldown", XMLNoDefault(0.5))
	cooldown: number = 0.5;
	@Serialize("XPBonus")
	xpBonus?: number;

	@Serialize("DisplayId")
	displayId?: string;
	@Serialize("Description")
	description?: string;
	extraTooltipData: EffectInfo[] = []

	getDisplayName(): string {
		return this.displayId || this.id;
	}

	createInstance(): Item {
		return new Item(this);
	}

	isWeapon() {
		return WeaponTypes.findIndex((type) => (type === this.slotType)) !== -1;
	}

	isAbility() {
		return AbilityTypes.findIndex((type) => (type === this.slotType)) !== -1;
	}

	getRange() {
		if (!this.hasProjectiles()) return undefined;
		return parseFloat(((this.projectiles[0].lifetime / 1000) * (this.projectiles[0].speed / 10)).toFixed(2));
	}

	getROF() {
		if (this.rateOfFire === 1) return;
		return `${this.rateOfFire * 100}%`
	}
}

export type EffectInfo = {
	description: string,
	name: string
}