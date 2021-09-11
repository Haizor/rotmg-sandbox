import { Data } from "common/asset/normal/Serializable";
import { XMLActivate } from "./ActivateParser";
import ConditionEffectSelf from "./ConditionEffectSelf";

@XMLActivate()
export default class ConditionEffectAura extends ConditionEffectSelf {
	@Data("@_range")
	range: number = 0;

	getRange(wis: number): number {
		return this.range + this.getBonusRange(wis);
	}

	getBonusRange(wis: number): number {
		if (wis < this.wisMin) return 0;
		return (wis - this.wisMin) * 0.1;
	}

	getName(): string {
		return "ConditionEffectAura"
	}
}