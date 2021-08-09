import { Stats } from "../Stats";
import IncrementStat from "./IncrementStat";

export default class Activate {
	static fromXML(xml: any): Activate | undefined {
		switch(xml["#text"]) {
			case "IncrementStat":
				return new IncrementStat(Stats.fromXML(xml))
		}
		return;
	}
}