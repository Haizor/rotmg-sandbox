import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import { BasicTexture, TextureProvider } from "common/asset/rotmg/data/Texture";
import LivingObject from "../obj/LivingObject";

const statusEffectMapper = new Map();

function TypeMapper() {
	return (constructor: Function) => {
		statusEffectMapper.set(constructor.prototype.getID(), constructor);
	}
}

export default abstract class StatusEffect {
	public time: number = 0;
	duration: number = 0;

	constructor(duration: number) {
		this.duration = duration;
	}

	abstract getID(): StatusEffectType;
	abstract getTexture(): TextureProvider;

	static fromType(type: StatusEffectType) {
		return statusEffectMapper.get(type);
	}
}
//TODO: just use one base status effect class, then do stuff based on that, no need for seperate classes
@TypeMapper()
export class HealingStatusEffect extends StatusEffect {
	public lastParticleTime = 0;

	getID(): StatusEffectType {
		return StatusEffectType.Healing;
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 47, false);
	}
}

@TypeMapper()
export class DamagingStatusEffect extends StatusEffect {
	getID(): StatusEffectType {
		return StatusEffectType.Damaging
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 49, false);
	}
}

@TypeMapper()
export class BerserkStatusEffect extends StatusEffect {
	getID(): StatusEffectType {
		return StatusEffectType.Berserk
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 50, false);
	}
}

@TypeMapper()
export class SpeedyStatusEffect extends StatusEffect {
	getID(): StatusEffectType {
		return StatusEffectType.Speedy
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 0, false);
	}
}

@TypeMapper()
export class SlowedStatusEffect extends StatusEffect {
	getID(): StatusEffectType {
		return StatusEffectType.Slowed
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 1, false);
	}
}

@TypeMapper()
export class ParalyzedStatusEffect extends StatusEffect {
	getID(): StatusEffectType {
		return StatusEffectType.Paralyzed
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 53, false);
	}
}
