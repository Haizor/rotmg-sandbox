import { Character } from "common/asset/rotmg/data/Character";
import Behavior from "../behaviour/Behavior";
import Shoot from "../behaviour/Shoot";
import { State } from "../behaviour/State";
import LivingObject from "./LivingObject";
import PlayerObject from "./PlayerObject";

type TargetSelector = (ply: PlayerObject) => boolean;

export default class EnemyObject extends LivingObject {
	data: Character;
	currentState: State;
	cooldowns: Map<Behavior, number> = new Map();

	constructor(data: Character) {
		super();
		this.data = data;
		this.texture = data.texture;
		this.setHealth(data.maxHp);


		const testState = new State();
		testState.behaviours.push(new Shoot(0).setBucket("test"));
		testState.behaviours.push(new Shoot(1).setRange(15).setBucket("test"));
		this.currentState = testState;
	}

	update(elapsed: number) {
		super.update(elapsed);

		const bucketsExecuted: string[] = [];

		for (const behavior of this.currentState.behaviours) {
			if (behavior.bucket !== undefined && bucketsExecuted.includes(behavior.bucket)) {
				continue;
			}

			const executed = behavior.execute(this);
			if (executed && behavior.bucket !== undefined) {
				bucketsExecuted.push(behavior.bucket);
			}
		}
	}
	getMaxHealth() {
		return this.data.maxHp;
	}

	getDefense() {
		return this.data.defense;
	}

	getTarget(selector: TargetSelector) {
		if (this.scene === null) return;
		for (const obj of this.scene.objects.values()) {
			if (obj instanceof PlayerObject && selector(obj)) {
				return obj;
			}
		}
		return undefined;
	} 

	setCooldown(behavior: Behavior) {
		this.cooldowns.set(behavior, this.time);
	}

	preventsMovement() {
		return false;
	}
}