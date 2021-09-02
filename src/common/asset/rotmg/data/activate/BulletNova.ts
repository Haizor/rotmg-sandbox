import { XMLActivate } from "./ActivateParser";

@XMLActivate("BulletNova")
export default class BulletNova {
	numShots: number = 16;
	constructor(xml: any) {
		this.numShots = xml["@_numShots"] || 16;
	}
}