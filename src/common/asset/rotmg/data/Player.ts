import { Data } from 'common/asset/normal/Serializable';
import { SlotType } from './Equipment';
import { Stats } from './Stats';
import XMLObject from './XMLObject'

const SlotTypeData = {
	serialize: () => {},
	deserialize: (xml: any) => {
		return xml.split(", ").map((num: string) => parseInt(num))
	}
}

const PlayerStats = {
	serialize: () => {},
	deserialize: (xml: any) => {
		const stats = new Stats();
		stats.hp = xml.MaxHitPoints["#text"];
		stats.mp = xml.MaxMagicPoints["#text"];
		stats.atk = xml.Attack["#text"];
		stats.def = xml.Defense["#text"];
		stats.spd = xml.Speed["#text"];
		stats.dex = xml.Dexterity["#text"];
		stats.vit = xml.HpRegen["#text"];
		stats.wis = xml.MpRegen["#text"];
		return stats;
	}
}

const MaxPlayerStats = {
	serialize: () => {},
	deserialize: (xml: any) => {
		const stats = new Stats();
		stats.hp = xml.MaxHitPoints["@_max"];
		stats.mp = xml.MaxMagicPoints["@_max"];
		stats.atk = xml.Attack["@_max"];
		stats.def = xml.Defense["@_max"];
		stats.spd = xml.Speed["@_max"];
		stats.dex = xml.Dexterity["@_max"];
		stats.vit = xml.HpRegen["@_max"];
		stats.wis = xml.MpRegen["@_max"];
		return stats;
	}
}

export default class Player extends XMLObject {
	@Data("Description")
	description: string = "This shouldn't show.";
	@Data("HitSound")
	hitSound: string = "";
	@Data("DeathSound")
	deathSound: string = "";
	@Data("SlotTypes", SlotTypeData)
	slotTypes: SlotType[] = [];
	@Data("Equipment", SlotTypeData)
	equipment: number[] = [];
	@Data("", PlayerStats, {deserializeFullObject: true})
	stats: Stats = new Stats();
	@Data("", MaxPlayerStats, {deserializeFullObject: true})
	maxStats: Stats = new Stats();
	@Data("BloodProb")
	bloodProb: number = 1;
}