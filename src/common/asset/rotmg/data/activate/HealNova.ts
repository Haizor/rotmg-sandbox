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
		return this.amount + this.getBonusHealAmount(wis);
	}

	getBonusHealAmount(wis: number): number {
		let extraWis = wis - this.wisMin;
		let extraHeal = 0; 
		while (extraWis - this.wisPerIncrease > 0) {
			extraWis -= this.wisPerIncrease;
			extraHeal += this.wisHealBase;
		}
		return extraHeal;
	}

	getRange(wis: number): number {
		return this.range + this.getBonusRange(wis)
	}

	getBonusRange(wis: number): number {
		if (wis < this.wisMin) return 0;
		return (wis - this.wisMin) * 0.1;
	}

	getName(): string {
		return "HealNova";
	}
}