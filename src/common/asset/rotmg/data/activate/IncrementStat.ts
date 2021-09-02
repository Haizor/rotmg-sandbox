import { Stats } from "../Stats";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("IncrementStat")
export default class IncrementStat {
	stats: Stats
	constructor(xml: any) {
		this.stats = Stats.fromXML(xml)
	}
}