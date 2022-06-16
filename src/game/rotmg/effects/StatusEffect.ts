import { BasicTexture, StatusEffectType, TextureProvider } from "@haizor/rotmg-utils";

const IndexMapper: any = {
	[StatusEffectType.Armored]: 16,
	[StatusEffectType.Berserk]: 50,
	[StatusEffectType.Damaging]: 49,
	[StatusEffectType.Energized]: 60,
	[StatusEffectType.Healing]: 47,
	[StatusEffectType.Inspired]: 62,
	[StatusEffectType.Invulnerable]: 17,
	[StatusEffectType.Speedy]: 0,

	[StatusEffectType["Armor Broken"]]: 55,
	[StatusEffectType.Bleeding]: 46,
	[StatusEffectType.Blind]: 41,
	[StatusEffectType.Confused]: 2,
	[StatusEffectType.Curse]: 58,
	[StatusEffectType.Darkness]: 57,
	[StatusEffectType.Dazed]: 44,
	[StatusEffectType.Drunk]: 43,
	[StatusEffectType.Exposed]: 59,
	[StatusEffectType.Hallucinating]: 42,
	[StatusEffectType.Hexed]: 42,
	[StatusEffectType.Paralyzed]: 53,
	[StatusEffectType["Pet Stasis"]]: 3,
	[StatusEffectType.Quiet]: 32,
	[StatusEffectType.Sick]: 39,
	[StatusEffectType.Silenced]: 33,
	[StatusEffectType.Slowed]: 1,
	[StatusEffectType.Stunned]: 45,
	[StatusEffectType.Unstable]: 56,
	[StatusEffectType.Weak]: 34,
}

export default class StatusEffect {
	public time: number = 0;
	public data: any = {};
	public type: StatusEffectType;
	duration: number = 0;

	constructor(type: StatusEffectType, duration: number, data: any = {}) {
		this.type = type;
		this.duration = duration;
		this.data = data;
	}

	getID(): StatusEffectType {
		return this.type;
	}

	getTexture(): TextureProvider | undefined {
		const index = IndexMapper[this.type];
		if (index === -1 || index === undefined) {
			return undefined;
		}
		return new BasicTexture("lofiInterface2", index, false);
	}
}