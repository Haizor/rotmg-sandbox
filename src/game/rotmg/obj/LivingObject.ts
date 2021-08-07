import RotMGObject from "./RotMGObject";

export default class LivingObject extends RotMGObject {
	hp: number;
	maxHp: number = 1000;

	constructor() {
		super();
		this.hp = this.maxHp;
	}

	damage(amount: number): boolean {
		this.hp -= amount;
		if (this.hp < 0) {
			this.kill();
		}
		return true;
	}

	onDeath() {

	}

	kill() {
		this.onDeath();
		this.delete();
	}
}