import { Data } from "common/asset/normal/Serializable";
import { XMLActivate } from "./ActivateParser";
import ConditionEffectSelf from "./ConditionEffectSelf";

@XMLActivate()
export default class ConditionEffectAura extends ConditionEffectSelf {
	@Data("@_range")
	range: number = 0;

	getRange(wis: number): number {
		if (wis < this.wisMin) return this.range;
		return this.range * (1 + (wis - this.wisMin) / this.wisMin)
	}

	getName(): string {
		return "ConditionEffectAura"
	}
}