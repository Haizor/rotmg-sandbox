
import { Serialize } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeSerializer } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("ConditionEffectAura")
export default class ConditionEffectAura implements Activate {
	@Serialize("@_effect", StatusEffectTypeSerializer)
	effect: StatusEffectType = StatusEffectType.Healing;
	duration: number = 0;
	range: number = 0;

	constructor(xml: any) {
		this.effect = StatusEffectType[xml["@_effect"] as keyof typeof StatusEffectType]
		this.duration = xml["@_duration"];
		this.range = xml["@_range"];
	}

	getName(): string {
		return "ConditionEffectAura"
	}
}