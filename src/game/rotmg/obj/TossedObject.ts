import AssetManager from "common/asset/normal/AssetManager";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import Particle from "./Particle";
import RotMGObject from "./RotMGObject";

export type TossedObjectOptions = {
	objectId: string;
	start: Vec2;
	target: Vec2;
	tossTime: number;
	color: Color;
}

export default class TossedObject extends RotMGObject {
	objectId: string;
	target: Vec2;
	tossTime: number;

	private _startPosition: Vec2;
	private _particleRate = 10;
	private _lastParticleTime = -this._particleRate;

	constructor(options: TossedObjectOptions) {
		super();
		console.log(options)
		this.objectId = options.objectId;
		this.target = options.target;
		this.position = options.start;
		this._startPosition = options.start;

		this.tossTime = options.tossTime;
		this.color = options.color;
	}

	canCollideWith() {
		return false;
	}

	collidesWith() {
		return false;
	}

	update(elapsed: number) {
		if (this.scene === null) return;
		const assetManager = this.getAssetManager() as AssetManager;

		super.update(elapsed);

		this.position = Vec2.lerp(this._startPosition, this.target, this.time / this.tossTime)
		this.z = Math.abs(Math.pow((this.time / this.tossTime - 0.5) * 2, 2)) * -5 + 5

		if (this.time > this.tossTime) {
			const obj = new RotMGObject(assetManager.get<XMLObject>("rotmg", this.objectId)?.value);
			obj.position = this.target;
			this.scene.addObject(obj);
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