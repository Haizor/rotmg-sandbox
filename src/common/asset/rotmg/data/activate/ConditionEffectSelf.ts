import { Data } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeSerializer } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ConditionEffectSelf implements Activate {
	@Data("@_effect", StatusEffectTypeSerializer())
	effect: StatusEffectType = StatusEffectType.Healing;
	duration: number = 0;
	wisMin: number = 50;
	wisPerDuration?: number;
	wisDurationBase?: number;

	constructor(xml: any) {
		this.effect = StatusEffectType[xml["@_effect"] as keyof typeof StatusEffectType];
		this.duration = xml["@_duration"];
		this.wisMin = xml["@_wisMin"];
		this.wisPerDuration = xml["@_wisPerDuration"];
		this.wisDurationBase = xml["@_wisDurationBase"];
	}

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