import Trap from "common/asset/rotmg/data/activate/Trap";
import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import StatusEffect from "../effects/StatusEffect";
import { DamageSource } from "./DamageSource";
import EnemyObject from "./EnemyObject";
import NovaEffect from "./NovaEffect";
import Particle from "./Particle";

export default class TrapObject extends GameObject {
	data: Trap;
	activateRadius: number;
	color: Color;
	time: number = 0;
	lastParticleTime: number = Number.MIN_SAFE_INTEGER
	triggered: boolean = false;

	//TODO: figure out why collisions are triggering even after the trap is deleted
	constructor(position: Vec2, data: Trap) {
		super();
		this.data = data;
		this.activateRadius = this.data.radius * this.data.sensitivity;
		this.color = Color.fromHexNumber(this.data.color);
		this.position = position;
	}

	onAddedToScene() {
		this.move(Vec2.Zero)
	}

	doInitialCheck() {

	}

	getCollisionTags() {
		return ["enemy"];
	}

	canCollideWith(obj: GameObject) {
		return obj.hasTag("enemy");
	}

	collidesWith(newPos: Vec2, obj: GameObject) {
		if (!this.triggered && Vec2.dist(this.position, obj.position) <= this.activateRadius) {
			return true;
		}
		return false;
	}

	onCollision() {
		console.log("?")
		this.trigger();
	}

	update(elapsed: number) {
		this.time += elapsed;
		if (this.lastParticleTime + 1000 < this.time) {
			for (let i = 0; i < 20; i++) {
				const angle = (2 * Math.PI / 20) * i;
				const pos = Vec2.Zero.add(0, this.activateRadius).rotate(angle).add(this.position);
				const particle = new Particle({
					color: Color.fromHexNumber(this.data.color),
					lifetime: 1000,
					target: pos,
				})
				particle.z = 0;
				this.scene?.addObject(particle);
			}
			this.lastParticleTime = this.time;
		}
		if (this.time > this.data.duration * 1000) {
			this.delete();
		}
	}

	trigger() {
		if (this.scene === null) {
			throw new Error("Shouldn't be triggering traps when they have no scene!")
		}

		this.scene.addObject(new NovaEffect({
			colors: [this.color],
			cycles: 10,
			lifetime: 200,
			range: this.data.radius,
			target: this.position
		}))

		for (const obj of this.scene.getObjectsWithTag("enemy")) {
			if (this.collidesWith(Vec2.Zero, obj)) {
				const enemy = obj as EnemyObject;
				enemy.damage(new DamageSource(this, this.data.totalDamage));
				enemy.addStatusEffect(new StatusEffect(this.data.condEffect, this.data.condDuration * 1000))
			}
		}
		this.delete();
		this.triggered = true;
	}
}