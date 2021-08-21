import StatusEffectType from "../StatusEffectType";
import Activate from "./Activate";

export default class ConditionEffectSelf extends Activate {
	effect: StatusEffectType;
	duration: number;

	constructor(effect: StatusEffectType, duration: number) {
		super();
		this.effect = effect;
		this.duration = duration;
	}
}