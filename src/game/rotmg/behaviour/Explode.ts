import Vec2 from "game/engine/logic/Vec2";
import { EnemyCollisionFilter } from "../obj/CollisionFilter";
import ProjectileObject from "../obj/ProjectileObject";
import Behavior, { BehaviorExecutionOptions } from "./Behavior";

export type ExplodeOptions = {
	initialDelay?: number;
	range?: number;
	numShots?: number;
	arcDegrees?: number;
	projectileId?: number;
	dropLoot?: boolean;
	giveXP?: boolean;
}

export default class Explode extends Behavior {
	initialDelay: number = 0;
	range: number = 5.0;
	numShots: number = 12;
	arcDegrees: number = 360;
	projectileId: number = 0;
	dropLoot: boolean = false;
	giveXP: boolean = false;

	constructor(options: ExplodeOptions) {
		super();
		Object.assign(this, options);
	}

	execute({enemy, elapsed}: BehaviorExecutionOptions) {
		const target = enemy.getTarget((ply) => Vec2.dist(enemy.position, ply.position) < this.range || this.range === 0);
		if (target === undefined) return false;
		const data = enemy.getProjectile(this.projectileId);
		for (let i = 0; i < this.numShots; i++) {
			const angle = (this.arcDegrees / this.numShots) * i;
			const projectile = new ProjectileObject(enemy.position, data, { collisionFilter: EnemyCollisionFilter, angle })
			enemy.getScene()?.addObject(projectile);
		}
		enemy.delete();
		return true;
	}
}