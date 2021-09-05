import { Action } from "common/asset/rotmg/atlas/NewSpritesheet";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Vec2 from "game/engine/logic/Vec2";
import { EnemyCollisionFilter } from "../obj/CollisionFilter";
import ProjectileObject from "../obj/ProjectileObject";
import Behavior, { BehaviorExecutionOptions } from "./Behavior";

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

	execute({enemy}: BehaviorExecutionOptions) {
		if (enemy.time < (enemy.cooldowns.get(this) ?? 0) + this.cooldown * 1000) {
			return false;
		}

		if (enemy.hasStatusEffect(StatusEffectType.Stunned)) {
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
		enemy.action = Action.Attack;
		enemy.frameSwitchDelay = this.cooldown * 1000;

		return true;
	}
}