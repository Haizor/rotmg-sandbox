import Activate from "./Activate";

export default class BulletNova {
	numShots: number = 16;
	constructor(numShots?: number) {
		this.numShots = numShots || 16;
	}
}