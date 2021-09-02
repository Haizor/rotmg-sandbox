import StatusEffectType from "../StatusEffectType";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("ConditionEffectAura")
export default class ConditionEffectSelf {
	effect: StatusEffectType;
	duration: number;

	constructor(xml: any) {
		this.effect = StatusEffectType[xml["@_effect"] as keyof typeof StatusEffectType];
		this.duration = xml["@_duration"];
	}
}