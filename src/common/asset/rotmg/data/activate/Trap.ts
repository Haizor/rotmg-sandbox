import { Data } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class Trap implements Activate {
	@Data("@_radius")
	radius: number = 3.5;
	@Data("@_totalDamage")
	totalDamage: number = 60
	@Data("@_condEffect", StatusEffectTypeData)
	condEffect: StatusEffectType = StatusEffectType.Slowed
	@Data("@_condDuration")
	condDuration: number = 3;
	@Data("@_color")
	color: number = 0xFF0000;
	@Data("@_duration")
	duration: number = 20;
	@Data("@_throwTime")
	throwTime: number = 1;
	@Data("@_sensitivity")
	sensitivity: number = 0.5;

	getName(): string {
		return "Trap";
	}
}