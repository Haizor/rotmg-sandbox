import { Data } from "common/asset/normal/Serializable";
import StatsData, { Stats } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class IncrementStat implements Activate {
	@Data("", StatsData, { deserializeFullObject: true })
	stats: Stats = new Stats();

	getName(): string {
		return "IncrementStat";
	}
}