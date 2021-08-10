import Vec2 from "game/engine/logic/Vec2";
import EnemyObject from "../obj/EnemyObject";
import Behavior, { BehaviorExecutionOptions } from "./Behavior";

export default class Follow extends Behavior {
	acquireRange: number = 10;
	range: number = 3;
	speed: number = 1;
	duration: number = 30;
	cooldown: number = 5;
	predictive: boolean = false;

	execute({enemy, elapsed}: BehaviorExecutionOptions) {
		const target = enemy.getTarget((ply) => {
			const dist = Vec2.dist(ply.position, enemy.position);
			return dist < this.acquireRange && dist > this.range
		});
		if (target === undefined) return false;
		enemy.moveTowards(target.position, (this.speed / 500) * elapsed);
		return true;
	}
}