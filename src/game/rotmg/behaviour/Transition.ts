import EnemyObject from "../obj/EnemyObject";
import { State } from "./State";

export type TransitionOptions = {
	afterTime?: number;
	hitpointsLessThan?: number;
}

export default class Transition {
	afterTime?: number;
	hitpointsLessThan?: number;
	target: string;
	parent?: State

	constructor(target: string, options: TransitionOptions) {
		this.target = target;
		this.afterTime = options.afterTime;
		this.hitpointsLessThan = options.hitpointsLessThan;
	}

	shouldTransition(enemy: EnemyObject) {
		if (this.afterTime !== undefined) {
			return enemy.timeInState > this.afterTime * 1000
		}
		if (this.hitpointsLessThan !== undefined) {
			return (enemy.getHealth() / enemy.getMaxHealth()) < this.hitpointsLessThan;
		}
	}
}