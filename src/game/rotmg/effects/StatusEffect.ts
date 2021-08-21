import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import { BasicTexture, TextureProvider } from "common/asset/rotmg/data/Texture";
import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import Vec3 from "game/engine/logic/Vec3";
import LivingObject from "../obj/LivingObject";
import Particle from "../obj/Particle";
import PlayerObject from "../obj/PlayerObject";

export default abstract class StatusEffect {
	protected _time: number = 0;
	duration: number = 0;

	constructor(duration: number) {
		this.duration = duration;
	}

	onApply(living: LivingObject) {}
	onRemove(living: LivingObject) {}

	update(living: LivingObject, elapsed: number) {
		this._time += elapsed;
		if (this._time > this.duration) {
			living.removeStatusEffect(this.getID())
		}
	}

	abstract getID(): StatusEffectType;
	abstract getTexture(): TextureProvider;

	static fromType(type: StatusEffectType) {
		switch(type) {
			case StatusEffectType.Healing:
				return HealingStatusEffect;
			case StatusEffectType.Damaging:
				return DamagingStatusEffect;
			case StatusEffectType.Berserk:
				return BerserkStatusEffect;
			case StatusEffectType.Speedy:
				return SpeedyStatusEffect
		}
	}
}

export class HealingStatusEffect extends StatusEffect {
	private _lastParticleTime = 0;

	update(living: LivingObject, elapsed: number) {
		super.update(living, elapsed);

		if (this._lastParticleTime + 250 < this._time) {
			const particle = new Particle({
				target: living, 
				offset: Vec2.random(true),
				scale: Math.random() + 0.5,
				lifetime: 500, 
				color: Color.White, 
				delta: new Vec3(0, 0, 2)});
			living.getScene()?.addObject?.(particle);
			this._lastParticleTime = this._time;
		}
		if (!living.hasStatusEffect(StatusEffectType.Sick)) {
			living.heal((20 / 1000) * elapsed);
		}
	}

	getID(): StatusEffectType {
		return StatusEffectType.Healing;
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 47, false);
	}
}

export class DamagingStatusEffect extends StatusEffect {
	onApply(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.damageMultiplier = 2;
		}
	}

	onRemove(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.damageMultiplier = 1;
		}
	}

	getID(): StatusEffectType {
		return StatusEffectType.Damaging
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 49, false);
	}
}

export class BerserkStatusEffect extends StatusEffect {
	onApply(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.rofMultiplier = 2;
		}
	}

	onRemove(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.rofMultiplier = 1;
		}
	}

	getID(): StatusEffectType {
		return StatusEffectType.Berserk
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 50, false);
	}
}

export class SpeedyStatusEffect extends StatusEffect {
	onApply(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.speedMultiplier = 2;
		}
	}

	onRemove(living: LivingObject) {
		if (living instanceof PlayerObject) {
			living.speedMultiplier = 1;
		}
	}

	getID(): StatusEffectType {
		return StatusEffectType.Speedy
	}

	getTexture() {
		return new BasicTexture("lofiInterface2", 0, false);
	}
}