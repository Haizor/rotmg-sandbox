import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class BulletNova implements Activate {
	numShots: number = 16;
	color: string = "FF00AA";
	constructor(xml: any) {
		this.numShots = xml["@_numShots"] ?? 16;
		this.color = xml["@_color"] ?? "FF00AA";
	}

	getName(): string {
		return "BulletNova"
	}
}