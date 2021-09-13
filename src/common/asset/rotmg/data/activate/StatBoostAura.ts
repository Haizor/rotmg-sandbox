import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import StatsData, { Stats, StatType } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";
import StatBoostSelf from "./StatBoostSelf";

@XMLActivate()
export default class StatBoostAura extends StatBoostSelf {
	@Data("@_range")
	range: number = 4;
	@Data("@_wisPerRange")
	wisPerRange: number = 1;
	@Data("@_wisRangeBase")
	wisRangeBase: number = 0.1;

	getRange(wis: number): number {
		return this.range + this.getBonusRange(wis);
	}

	getBonusRange(wis: number): number {
		if (wis < this.wisMin) return 0;
		return (wis - this.wisMin) * this.wisRangeBase;
	}

	getName(): string {
		return "StatBoostAura";
	}
}