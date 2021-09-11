import { Data } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ConditionEffectSelf implements Activate {
	@Data("@_effect", StatusEffectTypeData)
	effect: StatusEffectType = StatusEffectType.Healing;
	@Data("@_duration")
	duration: number = 0;
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_wisPerDuration")
	wisPerDuration: number = 10;
	@Data("@_wisDurationBase")
	wisDurationBase: number = 1;

	getDuration(wis: number): number {
		return this.duration + this.getBonusDuration(wis);
	}

	getBonusDuration(wis: number): number {
		if (wis < this.wisMin) return 0;

		let extraWis = wis - this.wisMin;
		let extraDuration = 0; 
		while (extraWis - this.wisPerDuration > 0) {
			extraWis -= this.wisPerDuration;
			extraDuration += this.wisDurationBase;
		}
		return extraDuration;
	}

	getName(): string {
		return "ConditionEffectSelf"
	}
}