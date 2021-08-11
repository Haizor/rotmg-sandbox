import Activate from "./Activate";

export default class BulletNova extends Activate {
	numShots: number = 16;
	constructor(numShots?: number) {
		super();
		this.numShots = numShots || 16;
	}
}