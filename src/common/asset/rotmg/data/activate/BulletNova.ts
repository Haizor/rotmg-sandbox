import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("BulletNova")
export default class BulletNova implements Activate {
	numShots: number = 16;
	constructor(xml: any) {
		this.numShots = xml["@_numShots"] || 16;
	}

	getName(): string {
		return "BulletNova"
	}
}