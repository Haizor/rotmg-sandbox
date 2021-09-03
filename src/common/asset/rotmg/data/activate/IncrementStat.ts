import { Stats } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("IncrementStat")
export default class IncrementStat implements Activate {
	stats: Stats = new Stats();
	constructor(xml: any) {
		this.stats = Stats.fromXML(xml)
	}

	getName(): string {
		return "IncrementStat";
	}
}