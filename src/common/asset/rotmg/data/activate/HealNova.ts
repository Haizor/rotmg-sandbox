import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class HealNova implements Activate {
	range: number = 2.5;
	amount: number = 40;
	wisMin: number = 50;
	wisPerIncrease: number = 10;
	wisHealBase: number = 30;
	splitHealing: boolean = true;

	constructor(xml: any) {
		this.range = xml["@_range"];
		this.amount = xml["@_amount"];
		this.wisMin = xml["@_wisMin"];
		this.wisPerIncrease = xml["@_wisPerIncrease"];
		this.wisHealBase = xml["@_wisHealBase"];
		this.splitHealing = xml["@_splitHealing"];
	}

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