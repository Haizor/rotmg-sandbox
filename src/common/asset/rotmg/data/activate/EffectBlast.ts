import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class EffectBlast implements Activate {
	@Data("@_condDuration")
	condDuration: number = 0;
	@Data("@_condEffect", StatusEffectTypeData)
	condEffect: StatusEffectType = StatusEffectType.Nothing;
	@Data("@_radius")
	radius: number = 3;
	@Data("@_collapseEffect", XMLBoolean)
	collapseEffect: boolean = false;
	@Data("@_wisMin")
	wisMin: number = 50;
	@Data("@_color")
	color: number = 0xCCCCCC;

	wisPerIncrease: number = 10;
	wisDurationBase: number = 1;

	getName() {
		return "EffectBlast";
	}

	getRadius(wis: number): number {
		if (this.wisMin === -1) return this.radius;
		return this.radius + ((wis - this.wisMin) * 0.1);
	}

	getDuration(wis: number): number {
		if (this.wisMin === -1) return this.condDuration;

		let extraWis = wis - this.wisMin;
		let extraDuration = 0; 
		while (extraWis > 0) {
			extraWis -= this.wisPerIncrease;
			extraDuration += this.wisDurationBase;
		}
		return this.condDuration + extraDuration;
	}
}