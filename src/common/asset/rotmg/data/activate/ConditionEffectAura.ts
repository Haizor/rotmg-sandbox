import { XMLActivate } from "./ActivateParser";
import ConditionEffectSelf from "./ConditionEffectSelf";

@XMLActivate()
export default class ConditionEffectAura extends ConditionEffectSelf {
	range: number = 0;

	constructor(xml: any) {
		super(xml);
		this.range = xml["@_range"];
	}

	getRange(wis: number): number {
		if (wis < this.wisMin) return this.range;
		return this.range * (1 + (wis - this.wisMin) / this.wisMin)
	}

	getName(): string {
		return "ConditionEffectAura"
	}
}