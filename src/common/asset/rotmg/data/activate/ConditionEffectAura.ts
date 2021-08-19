
import StatusEffectType from "../StatusEffectType";
import Activate from "./Activate";

export default class ConditionEffectAura extends Activate {
	effect: StatusEffectType;
	duration: number;
	range: number;

	constructor(effect: StatusEffectType, duration: number, range: number) {
		super();
		this.effect = effect;
		this.duration = duration;
		this.range = range;
	}
}