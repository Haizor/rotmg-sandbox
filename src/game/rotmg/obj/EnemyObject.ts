import { Character } from "common/asset/rotmg/data/Character";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import Behavior from "../behaviour/Behavior";
import Explode from "../behaviour/Explode";
import Follow from "../behaviour/Follow";
import Shoot from "../behaviour/Shoot";
import { State } from "../behaviour/State";
import Transition from "../behaviour/Transition";
import LivingObject from "./LivingObject";

type TargetSelector = (ply: GameObject) => boolean;
type MoveTarget = {
	speed: number,
	pos: Vec2
}

export default class EnemyObject extends LivingObject {
	data: Character;
	baseState: State;
	currentState: State;
	cooldowns: Map<Behavior, number> = new Map();
	timeInState: number = 0;
	moveTarget: MoveTarget | undefined;

	constructor(data: Character) {
		super();
		this.xmlData = data;
		this.data = data
		this.texture = data.texture;
		this.setHealth(data.maxHp);
		this.addTag("enemy")

		const attacking = new State("Attacking");
		attacking.addBehavior(new Shoot(0));

		const chasing = new State("Chasing");
		chasing.addBehavior(new Shoot(1));
		chasing.addBehavior(new Follow());

		attacking.setTransition(new Transition("Chasing", {afterTime: 5}));
		chasing.setTransition(new Transition("Attacking", {afterTime: 5}));

		const first = new State("First");
		first.addState(attacking);
		first.addState(chasing);
		first.setTransition(new Transition("Explode", {hitpointsLessThan: 0.5}));

		const explode = new State("Explode");
		explode.addBehavior(new Explode({projectileId: 1}));
	
		const root = new State("Root")
		root.addState(first);
		root.addState(explode);

		this.baseState = root;
		this.currentState = attacking;
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.hasStatusEffect(StatusEffectType.Stasis)) {
			return;
		}

		this.timeInState += elapsed;

		const bucketsExecuted: string[] = [];
		const behaviors = this.currentState.getAllBehaviors();

		for (const behavior of behaviors) {
			if (behavior.bucket !== undefined && bucketsExecuted.includes(behavior.bucket)) {
				continue;
			}

			const executed = behavior.execute({
				enemy: this,
				elapsed
			});
			if (executed && behavior.bucket !== undefined) {
				bucketsExecuted.push(behavior.bucket);
			}
		}

		const transitions = this.currentState.getAllTransitions();

		for (const transition of transitions) {
			if (transition.shouldTransition(this)) {
				if (transition.parent?.parent === undefined) {
					return;
				}
				this.currentState = transition.parent.parent.getState(transition.target) as State;
				this.timeInState = 0;
			}
		}
		if (this.currentState.transition !== undefined && this.currentState.transition.shouldTransition(this)) {

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

	getProjectile(id: number) {
		return this.data.projectiles[id];
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

	setCooldown(behavior: Behavior) {
		this.cooldowns.set(behavior, this.time);
	}

	preventsMovement() {
		return false;
	}
}