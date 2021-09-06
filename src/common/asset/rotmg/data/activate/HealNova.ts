import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class HealNova implements Activate {
	@Data("@_range")
	range: number = 2.5;
	@Data("@_amount")
	amount: number = 40;
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_wisPerIncrease")
	wisPerIncrease: number = 10;
	@Data("@_wisHealBase")
	wisHealBase: number = 30;
	@Data("@_splitHealing", XMLBoolean)
	splitHealing: boolean = true;

	getHealAmount(wis: number) {
		if (wis < this.wisMin) {
			return this.amount;
		}
		let extraWis = wis - this.wisMin;
		let extraHeal = 0; 
		while (extraWis > 0) {
			extraWis -= this.wisPerIncrease;
			extraHeal += this.wisHealBase;
		}
		return this.amount + extraHeal;
	}

	getRange(wis: number): number {
		if (wis < this.wisMin) return this.range;

		return this.range * (1 + (wis - this.wisMin) / this.wisMin)
	}

	getName(): string {
		return "HealNova";
	}
}