import { Stats } from "../Stats";
import BulletNova from "./BulletNova";
import IncrementStat from "./IncrementStat";

export default class Activate {
	static fromXML(xml: any): Activate | undefined {
		const activateName = xml["#text"] ?? xml;
		switch(activateName) {
			case "IncrementStat":
				return new IncrementStat(Stats.fromXML(xml))
			case "BulletNova":
				return new BulletNova(xml["@_numShots"]);
		}
		return;
	}
}