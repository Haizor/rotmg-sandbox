import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import { Transition, State, Character, Behavior, StatusEffectType, Projectile, ShootBehavior, Follow, Wander, BackAndForth, Charge, Circle, Sprite, Action } from "rotmg-utils";
import { EnemyCollisionFilter } from "./CollisionFilter";
import LivingObject from "./LivingObject";
import ProjectileObject from "./ProjectileObject";
import RotMGObject from "./RotMGObject";

const { Shoot } = ShootBehavior;

type TargetSelector = (ply: GameObject) => boolean;
type MoveTarget = {
	speed: number,
	pos: Vec2
}

enum ExecutionResult {
	Success,
	Fail
}

type TransitionData = {
	transition: Transition;
	parent: State;
}

export default class EnemyObject extends LivingObject {
	data: Character;
	moveTarget: MoveTarget | undefined;
	baseState: State;
	currentState: State;
	executor: BehaviorExecutor;
	cooldowns: Map<any, number> = new Map();
	angle: number = 0;

	private _behaviorData: Map<Behavior, any> = new Map();
	private _stateStartTime = 0;

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

	canCollideWith(obj: GameObject) {
		return !obj.hasTag("player")
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.moveTarget !== undefined) {
			this.moveTowards(this.moveTarget.pos, this.moveTarget.speed / 200 * elapsed)
			if (Vec2.dist(this.moveTarget.pos, this.position) < 0.1) {
				delete this.moveTarget;
			}
		}

		if (this.hasStatusEffect(StatusEffectType.Stasis)) {
			return;
		}
	}

	serverUpdate() {
		super.serverUpdate();
		if (this.moveTarget && this.position.nearlyEquals(this.moveTarget.pos, 0.25)) {
			delete this.moveTarget;
		}

		const executedBuckets: Map<string, boolean> = new Map();
		let behaviours: Behavior[] = [];
		let transitions: TransitionData[] = [];
		let state: State | undefined = this.currentState;
		while (state !== undefined) {
			behaviours = [...behaviours, ...state.behaviors];
			transitions = [...transitions, ...state.transitions.map((t) => { return { transition: t, parent: state?.parent as State }})];
			state = state.parent;
		}

		for (const behavior of behaviours) {
			if (behavior.bucket !== undefined && executedBuckets.get(behavior.bucket)) {
				this.resetBehaviorData(behavior);
				continue;
			}

			if (this.isOnCooldown(behavior)) {
				continue;
			}

			const result = this.executor.execute(behavior);
			if (result === ExecutionResult.Success) {
				const jitter = ("cooldownJitter" in behavior && (behavior as any).cooldownJitter === true) ? Math.random() + 0.5 : 1;
				this.cooldowns.set(behavior, this.time + ((behavior.cooldown ?? 0 * jitter) * 1000));
				if (behavior.bucket !== undefined) {
					executedBuckets.set(behavior.bucket, true);
				}
			}
		}

		for (const transition of transitions) {
			if (this.canTransition(transition.transition)) {
				this.currentState = transition.parent.getChildWithID(transition.transition.id) as State;
				this._stateStartTime = this.time;
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
		return ((this.cooldowns.get(behavior) as number) > this.time);
	}

	getTimeInState() {
		return this.time - this._stateStartTime;
	}

	canTransition(transition: Transition) {
		if (transition.hitpointsLessThan && this.getHealthRatio() > transition.hitpointsLessThan) return false;
		if (transition.afterTime && (this._stateStartTime + transition.afterTime * 1000) > this.time) return false;
		return true;
	}

	getProjectile(id: number): Projectile {
		return this.data.projectiles[id] ?? this.data.projectiles[0];
	} 

	getBehaviorData(behavior: Behavior): any {
		if (!this._behaviorData.has(behavior)) {
			const data = {};
			this._behaviorData.set(behavior, data);
		}
		return this._behaviorData.get(behavior);
	}

	resetBehaviorData(behavior: Behavior): void {
		this._behaviorData.delete(behavior);
	}

	getSpeedMultiplier(): number {
		if (this.hasStatusEffect(StatusEffectType.Paralyzed)) {
			return 0;
		}
		if (this.hasStatusEffect(StatusEffectType.Slowed)) {
			return 0.5;
		}
		return 1;
	}

	preventsMovement(): boolean {
		return false;
	}
}

type Executor<T> = (this: EnemyObject, behavior: T) => ExecutionResult;

class BehaviorExecutor {
	enemy: EnemyObject;
	executors: Map<any, Executor<any>> = new Map();
	constructor(enemy: EnemyObject) {
		this.enemy = enemy;
		this.executors.set(Shoot, this.shoot);
		this.executors.set(Follow, this.follow);
		this.executors.set(Wander, this.wander);
		this.executors.set(BackAndForth, this.backAndForth);
		this.executors.set(Charge, this.charge);
		this.executors.set(Circle, this.circle)
	}

	execute(behavior: Behavior): ExecutionResult {
		if (!this.executors.has(behavior.constructor)) {
			return ExecutionResult.Fail;
		}

		return (this.executors.get(behavior.constructor) as Executor<any>).call(this.enemy, behavior);
	} 

	//TODO: figure out the shoot behavior shitting the bed
	shoot(this: EnemyObject, behavior: any) {
		
		if (this.getTimeInState() / 1000 < behavior.offset) return ExecutionResult.Fail;
		const target = this.getTarget((ply) => Vec2.dist(ply.position, this.position) <= behavior.range) as RotMGObject;
		if (target === undefined) return ExecutionResult.Fail;
		const data = this.getProjectile(behavior.projectileId);

		let angle = 0;
		switch(behavior.type) {
			case "auto": 
				angle = behavior.defaultAngle ?? 90;
				break;
			case "targeted":
				const extraPos = target.movementDelta.mult(behavior.predictive);
				angle = Vec2.angleBetween(this.position, target.position.add(extraPos));
				break;
			case "forward":
				angle = this.angle;
				break;
		}


		for (let i = 0; i < behavior.numShots; i++) {
			let currAngle = angle - (behavior.angle / 2) - (i * behavior.angle) + ((behavior.angle * behavior.numShots) / 2)
			const projectile = new ProjectileObject(this.position, data, {
				angle: currAngle,
				collisionFilter: EnemyCollisionFilter,
			})
			this.scene?.addObject(projectile);
		}

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

	backAndForth(this: EnemyObject, behavior: BackAndForth) {
		const data = this.getBehaviorData(behavior);
		if (!data.startPos) data.startPos = this.position;
		if (!data.angle) data.angle = behavior.angle;
		if (!data.dir) data.dir = 1;

		data.angle += behavior.turnRate;
		if (Vec2.dist(this.position, data.startPos) > behavior.radius) {
			data.dir = data.dir === 1 ? -1 : 1;
		}
		let direction = new Vec2(1, 0).rotate(data.angle * (Math.PI / 180)).mult(data.dir);

		this.moveTarget = {
			pos: this.position.add(direction),
			speed: behavior.speed
		}
		return ExecutionResult.Success;
	}

	charge(this: EnemyObject, behavior: Charge) {
		const target = this.getTarget((ply) => Vec2.dist(ply.position, this.position) <= behavior.range);
		if (target === undefined) return ExecutionResult.Fail;
		
		this.moveTarget = {
			pos: target.position,
			speed: behavior.speed
		}

		return ExecutionResult.Success;
	}

	circle(this: EnemyObject, behavior: Circle) {
		const target = this.getTarget((ply) => Vec2.dist(ply.position, this.position) <= behavior.acquireRange);
		if (target === undefined) return ExecutionResult.Fail;
		const data = this.getBehaviorData(behavior);
		if (!data.angle) data.angle = 0;

		data.angle += behavior.angularVelocity;

		const x = target.position.x + Math.cos(data.angle) * behavior.distance;
		const y = target.position.y + Math.sin(data.angle) * behavior.distance;
		const targetPos = new Vec2(x - this.position.x, y - this.position.y);

		this.moveTarget = {
			pos: this.position.add(targetPos),
			speed: behavior.speed
		}

		return ExecutionResult.Success
	}
}