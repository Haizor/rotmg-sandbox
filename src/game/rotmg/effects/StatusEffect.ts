import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import LivingObject from "../obj/LivingObject";
import PlayerObject from "../obj/PlayerObject";

export default abstract class StatusEffect {
	private _time: number = 0;
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

	static fromType(type: StatusEffectType) {
		switch(type) {
			case StatusEffectType.Healing:
				return HealingStatusEffect;
			case StatusEffectType.Damaging:
				return DamagingStatusEffect
		}
	}
}

export class HealingStatusEffect extends StatusEffect {
	update(living: LivingObject, elapsed: number) {
		super.update(living, elapsed);
		if (!living.hasStatusEffect(StatusEffectType.Sick)) {
			living.heal((20 / 1000) * elapsed);
		}
	}

	getID(): StatusEffectType {
		return StatusEffectType.Healing;
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
}