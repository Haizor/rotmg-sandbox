
import StatusEffectType from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("ConditionEffectAura")
export default class ConditionEffectAura implements Activate {
	effect: StatusEffectType;
	duration: number;
	range: number;

	constructor(xml: any) {
		this.effect = StatusEffectType[xml["@_effect"] as keyof typeof StatusEffectType]
		this.duration = xml["@_duration"];
		this.range = xml["@_range"];
	}

	getName(): string {
		return "ConditionEffectAura"
	}
}