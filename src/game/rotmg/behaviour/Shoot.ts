import Vec2 from "game/engine/logic/Vec2";
import { EnemyCollisionFilter } from "../obj/CollisionFilter";
import EnemyObject from "../obj/EnemyObject";
import ProjectileObject from "../obj/ProjectileObject";
import Behavior from "./Behavior";

export default class Shoot extends Behavior {
	range: number = 10;
	numShots: number = 1;
	cooldown: number = 0.5;
	projectileId: number;

	constructor(projectileId: number) {
		super();
		this.projectileId = projectileId;
	}

	setRange(range: number): this {
		this.range = range;
		return this;
	}

	execute(enemy: EnemyObject) {
		if (enemy.time < (enemy.cooldowns.get(this) ?? 0) + this.cooldown * 1000) {
			return false;
		}

		const target = enemy.getTarget((ply) => Vec2.dist(enemy.position, ply.position) <= this.range);
		if (target === undefined) return false;
		const projectileData = enemy.data.projectiles[this.projectileId];
		const proj = new ProjectileObject(enemy.position, projectileData, {
			angle: Vec2.angleBetween(enemy.position, target.position),
			collisionFilter: EnemyCollisionFilter
		});
		enemy.getScene()?.addObject(proj);

		enemy.setCooldown(this);

		return true;
	}
}