import { Stats } from "../Stats";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class StatBoostAura implements Activate {
	stats: Stats = new Stats();
	range: number;
	noStack: boolean;
	duration: number;
	constructor(xml: any) {
		this.stats = Stats.fromXML(xml)
		this.range = xml["@_range"];
		this.noStack = xml["@_noStack"];
		this.duration = xml["@_duration"]
	}

	getName(): string {
		return "StatBoostAura";
	}
}