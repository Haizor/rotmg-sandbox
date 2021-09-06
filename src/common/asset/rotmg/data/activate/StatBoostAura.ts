import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import StatsData, { Stats } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class StatBoostAura implements Activate {
	@Data("", StatsData, { deserializeFullObject: true })
	stats: Stats = new Stats();
	@Data("@_range")
	range: number = 4;
	@Data("@_noStack", XMLBoolean)
	noStack: boolean = true;
	@Data("@_duration")
	duration: number = 3;

	getName(): string {
		return "StatBoostAura";
	}
}