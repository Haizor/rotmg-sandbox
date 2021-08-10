import RotMGObject from "./RotMGObject";

export default class LivingObject extends RotMGObject {
	private hp: number;
	private maxHp: number = 1000;

	constructor() {
		super();
		this.hp = this.maxHp;
	}

	damage(amount: number): boolean {
		this.setHealth(this.hp - amount);
		this.onDamaged(amount);
		if (this.hp < 0) {
			this.kill();
		}
		return true;
	}

	onDamaged(amount: number) {}

	onDeath() {}

	getHealth() {
		return this.hp;
	}

	getMaxHealth() {
		return this.maxHp;
	}

	setHealth(health: number) {
		this.hp = Math.min(this.maxHp, health)
	}

	setMaxHealth(maxHealth: number) {
		this.maxHp = maxHealth;
		this.hp = Math.min(this.maxHp, this.hp);
	}

	kill() {
		this.onDeath();
		this.delete();
	}
}