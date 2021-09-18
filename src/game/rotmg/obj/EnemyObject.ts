import Behavior from "common/asset/rotmg/data/behaviour/Behavior";
import Follow from "common/asset/rotmg/data/behaviour/Follow";
import Shoot from "common/asset/rotmg/data/behaviour/Shoot";
import State from "common/asset/rotmg/data/behaviour/State";
import Transition from "common/asset/rotmg/data/behaviour/Transition";
import Wander from "common/asset/rotmg/data/behaviour/Wander";
import { Character } from "common/asset/rotmg/data/Character";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import { EnemyCollisionFilter } from "./CollisionFilter";
import LivingObject from "./LivingObject";
import ProjectileObject from "./ProjectileObject";

type TargetSelector = (ply: GameObject) => boolean;
type MoveTarget = {
	speed: number,
	pos: Vec2
}

enum ExecutionResult {
	Success,
	Fail
}

export default class EnemyObject extends LivingObject {
	data: Character;
	moveTarget: MoveTarget | undefined;
	baseState: State;
	stateChain: number[] = [];
	currentState: State;
	executor: BehaviorExecutor;
	cooldowns: Map<any, number> = new Map();

	constructor(data: Character, state: State) {
		super();
		this.xmlData = data;
		this.data = data
		this.texture = data.texture;
		this.setHealth(data.maxHp);
		this.animated = true;
		this.addTag("enemy");
		this.baseState = state;
		this.currentState = this.baseState;
		while (this.currentState.states.length > 0) {
			this.currentState = this.currentState.states[0];
		}
		this.executor = new BehaviorExecutor(this);
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.moveTarget !== undefined) {
			this.moveTowards(this.moveTarget.pos, this.moveTarget.speed / 1000 * elapsed)
			if (Vec2.dist(this.moveTarget.pos, this.position) < 0.1) {
				delete this.moveTarget;
			}
		}

		if (this.hasStatusEffect(StatusEffectType.Stasis)) {
			return;
		}
	}

	serverUpdate() {
		delete this.moveTarget;

		if (this.currentState.transition && this.canTransition(this.currentState.transition)) {
			this.currentState = this.currentState.parent?.getChildWithID(this.currentState.transition.id) as State;
		}

		const executedBuckets: Map<string, boolean> = new Map();
		let behaviours: Behavior[] = [];
		let state: State | undefined = this.currentState;
		while (state !== undefined) {
			behaviours = [...behaviours, ...state.behaviors];
			state = state.parent;
		}

		for (const behavior of behaviours) {
			if (behavior.bucket !== undefined && executedBuckets.get(behavior.bucket)) {
				continue;
			}

			if (this.isOnCooldown(behavior)) {
				continue;
			}

			const result = this.executor.execute(behavior);
			if (result === ExecutionResult.Success) {
				this.cooldowns.set(behavior, this.time);
				if (behavior.bucket !== undefined) {
					executedBuckets.set(behavior.bucket, true);
				}
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
		return this.scene.getObjectsWithTag("player")
			.filter((obj) => (selector(obj) && (!(obj instanceof LivingObject) || !obj.hasStatusEffect(StatusEffectType.Invisible))))
			.sort((a, b) => Vec2.dist(this.position, a.position) - Vec2.dist(this.position, b.position))[0]
	} 

	isOnCooldown(behavior: Behavior) {
		if (!this.cooldowns.has(behavior)) return false;
		if (behavior.cooldown === undefined) return false;
		return ((this.cooldowns.get(behavior) as number) + behavior.cooldown * 1000 > this.time);
	}

	canTransition(transition: Transition) {
		if (transition.hitpointsLessThan && this.getHealthRatio() > transition.hitpointsLessThan) return false;
		return true;
	}

	getProjectile(id: number) {
		return this.data.projectiles[id] ?? this.data.projectiles[0];
	} 

	getSpeedMultiplier() {
		if (this.hasStatusEffect(StatusEffectType.Paralyzed)) {
			return 0;
		}
		if (this.hasStatusEffect(StatusEffectType.Slowed)) {
			return 0.5;
		}
		return 1;
	}

	preventsMovement() {
		return false;
	}
}

type Executor<T> = (this: EnemyObject, behavior: T) => ExecutionResult;

class BehaviorExecutor {
	enemy: EnemyObject;
	executors: Map<any, Executor<any>> = new Map();
	constructor(enemy: EnemyObject) {
		this.enemy = enemy;
		this.executors.set(Shoot, this.shoot)
		this.executors.set(Follow, this.follow)
		this.executors.set(Wander, this.wander);
	}

	execute(behavior: Behavior): ExecutionResult {
		if (!this.executors.has(behavior.constructor)) {
			return ExecutionResult.Fail;
		}

		return (this.executors.get(behavior.constructor) as Executor<any>).call(this.enemy, behavior);
	} 

	shoot(this: EnemyObject, behavior: Shoot) {
		const target = this.getTarget((ply) => Vec2.dist(ply.position, this.position) <= behavior.range);
		if (target === undefined) return ExecutionResult.Fail;
		const angle = Vec2.angleBetween(this.position, target.position)
		const data = this.getProjectile(behavior.projectileId);
		const projectile = new ProjectileObject(this.position, data, {
			angle,
			collisionFilter: EnemyCollisionFilter,
		})
		this.scene?.addObject(projectile);
		return ExecutionResult.Success;
	}

	follow(this: EnemyObject, behavior: Follow) {
		const target = this.getTarget((ply) => Vec2.dist(ply.position, this.position) <= behavior.range);
		if (target === undefined) return ExecutionResult.Fail;
		this.moveTarget = {
			pos: target.position.copy(),
			speed: behavior.speed
		}

		return ExecutionResult.Success;
	}

	wander(this: EnemyObject, behavior: Wander) {
		this.moveTarget = {
			pos: this.position.add(new Vec2(Math.random() - 0.5, Math.random() - 0.5).mult(100)),
			speed: behavior.speed
		}
		return ExecutionResult.Success;
	}
}