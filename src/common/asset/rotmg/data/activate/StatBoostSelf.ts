import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import { StatType } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class StatBoostSelf implements Activate {
	@Data("@_stat")
	stat: StatType = "MAXHP";
	@Data("@_noStack", XMLBoolean)
	noStack: boolean = true;
	@Data("@_duration")
	duration: number = 3;
	@Data("@_amount")
	amount: number = 0;
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_wisPerDuration")
	wisPerDuration = 10;
	@Data("@_wisDurationBase")
	wisDurationBase = 1;
	@Data("@_wisPerAmount")
	wisPerAmount = 1;
	@Data("@_wisAmountBase")
	wisAmountBase = 0;

	getAmount(wis: number): number {
		return this.amount + this.getBonusAmount(wis);
	}

	getBonusAmount(wis: number): number {
		if (wis < this.wisMin) return 0;

		let extraWis = wis - this.wisMin;
		let extraAmount = 0; 
		while (extraWis - this.wisPerAmount > 0) {
			extraWis -= this.wisPerAmount;
			extraAmount += this.wisAmountBase;
		}
		return extraAmount;
	}


	getDuration(wis: number): number {
		return this.duration + this.getBonusDuration(wis);
	}

	getBonusDuration(wis: number): number {
		if (wis < this.wisMin) return 0;

		let extraWis = wis - this.wisMin;
		let extraDuration = 0; 
		while (extraWis - this.wisPerDuration > 0) {
			extraWis -= this.wisPerDuration;
			extraDuration += this.wisDurationBase;
		}
		return extraDuration;
	}

	getName(): string {
		return "StatBoostSelf";
	}
}