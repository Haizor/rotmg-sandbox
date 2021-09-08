import { Data } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

//how is it that deca has 10 million properties for skulls but necro is shit. curious.
@XMLActivate()
export default class VampireBlast implements Activate {
	@Data("@_radius")
	radius: number = 2.5;
	@Data("@_totalDamage")
	totalDamage: number = 35;
	@Data("@_ignoreDef")
	ignoreDef: number = 0;
	@Data("@_heal")
	heal: number = 25;
	@Data("@_healRange")
	healRange: number = 5
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_wisPerIncrease")
	wisPerIncrease: number = 10;
	@Data("@_wisDamageBase")
	wisDamageBase: number = 10;
	@Data("@_wisPerRad")
	wisPerRad: number = 10;
	@Data("@_incrRad")
	incrRad: number = 0.5;
	@Data("@_condEffect", StatusEffectTypeData)
	condEffect: StatusEffectType = StatusEffectType.Nothing;
	@Data("@_condDuration")
	condDuration: number = 0;
	@Data("@_color")
	color: string = "FF0000";

	getName(): string {
		return "VampireBlast";
	}

	getDamage(wis: number): number {
		if (wis < this.wisMin) return this.totalDamage;

		let extraWis = wis - this.wisMin;
		let extraDamage = 0;
		while (extraWis > 0) {
			extraWis -= this.wisPerIncrease;
			extraDamage += this.wisDamageBase;
		}
		return this.totalDamage + extraDamage;
	}

	getHealRadius(wis: number) {
		if (wis < this.wisMin) return this.healRange;
		let extraWis = wis - this.wisMin;
		let extraRad = 0;
		while (extraWis > 0) {
			extraWis -= this.wisPerRad;
			extraRad += this.incrRad;
		}
		return this.healRange + extraRad;
	}
}