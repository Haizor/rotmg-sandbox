import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import Particle from "./Particle";
import RotMGObject from "./RotMGObject";

export type OnTossLand = (position: Vec2) => void;

export type TossedObjectOptions = {
	onLand: (position: Vec2) => void;
	start: Vec2;
	target: Vec2;
	tossTime: number;
	color: Color;
}

export default class TossedObject extends RotMGObject {
	onLand: OnTossLand;
	target: Vec2;
	tossTime: number;

	private _startPosition: Vec2;
	private _particleRate = 10;
	private _lastParticleTime = -this._particleRate;

	constructor(options: TossedObjectOptions) {
		super();
		this.onLand = options.onLand;
		this.target = options.target;
		this.position = options.start;
		this._startPosition = options.start;

		this.tossTime = options.tossTime;
		this.color = options.color;

		if (this.tossTime === 0) {
			this.onLand(this.target);
			this.delete()
		}
	}

	canCollideWith() {
		return false;
	}

	collidesWith() {
		return false;
	}

	update(elapsed: number) {
		if (this.scene === null) return;

		super.update(elapsed);

		this.position = Vec2.lerp(this._startPosition, this.target, this.time / this.tossTime)
		this.z = (Math.abs(Math.pow((this.time / this.tossTime - 0.5) * 2, 2)) * -5 + 5) + 1

		if (this.time > this.tossTime) {
			this.onLand(this.position);
			this.delete();
		}

		if (this._lastParticleTime + this._particleRate < this.time) {
			const particle = new Particle({
				color: this.color,
				lifetime: 300,
				target: this.position,
				delta: Vec2.random().mult(5).toVec3(0),
				scale: 3
			})

			particle.z = this.z;
			this.scene?.addObject(particle)

			this._lastParticleTime = this.time;
		}
	}
}