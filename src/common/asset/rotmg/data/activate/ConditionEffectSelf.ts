import { Data } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeSerializer } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ConditionEffectSelf implements Activate {
	@Data("@_effect", StatusEffectTypeSerializer())
	effect: StatusEffectType = StatusEffectType.Healing;
	@Data("@_duration")
	duration: number = 0;
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_wisPerDuration")
	wisPerDuration?: number;
	@Data("@_wisDurationBase")
	wisDurationBase?: number;

	getDuration(wis: number): number {
		if (wis < this.wisMin) return this.duration;
		if (this.wisPerDuration !== undefined && this.wisDurationBase !== undefined) {
			let extraWis = wis - this.wisMin;
			let extraDuration = 0; 
			while (extraWis > 0) {
				extraWis -= this.wisPerDuration;
				extraDuration += this.wisDurationBase;
			}
			return this.duration + extraDuration;
		}
		return this.duration * (1 + (wis - this.wisMin) / this.wisMin)
	}

	getName(): string {
		return "ConditionEffectSelf"
	}
}