import AssetManager from "common/asset/normal/AssetManager";
import Rect from "../../engine/logic/Rect";
import Vec2 from "../../engine/logic/Vec2";
import GameObject, { RenderPriority } from "../../engine/obj/GameObject";
import Projectile from "../../../common/asset/rotmg/data/Projectile";
import ProjectileRender from "../../../common/asset/rotmg/data/ProjectileRender";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import RotMGObject from "./RotMGObject";
import { CollisionFilter } from "./CollisionFilter";

export type ProjectileOptions = {
	damage?: number,
	projNumber?: number,
	angle: number,
	collisionFilter: CollisionFilter
}

export default class ProjectileObject extends RotMGObject {
	data: Projectile;
	angle: number = 0;
	damage: number = 0;
	projNumber: number = 0;
	accelerationSpeed: number = 0;
	renderData?: ProjectileRender;
	filter: CollisionFilter
	private _currLifetime = 0;

	get position() {
		return this._position.add(this.getAmplitudeVec());
	}

	set position(pos: Vec2) {
		this._position = pos;
	}

	constructor(pos: Vec2, data: Projectile, options: ProjectileOptions) {
		super();
		this.data = data;
		this.renderPriority = RenderPriority.High;
		this.updatePosition(pos);
		this.angle = options.angle;
		this.damage = options.damage ?? this.data.getDamage() ?? 0;
		this.projNumber = options.projNumber ?? 0;
		this.filter = options.collisionFilter;
	}

	onAddedToScene() {
		this.setData(this.data);
	}

	getCollisionBox() {
		return Rect.Zero.expand(0.1, 0.1)
	}

	setData(data: Projectile) {
		this.data = data;
		const rotmg = this.getGame() as RotMGGame;
		this.renderData = this.getAssetManager()?.get("rotmg", data.objectId)?.value as ProjectileRender;
		this.sprite = rotmg.renderHelper?.getSpriteFromObject(this.renderData);
	} 

	canCollideWith(obj: GameObject): boolean {
		return this.filter(this, obj) && !(obj instanceof ProjectileObject);
	}

	collidesWith(newPos: Vec2, obj: GameObject) {
		return obj.getCollisionBox().translate(obj.position).contains(newPos);
	}

	preventsMovement() {
		return false;
	}

	onCollision(obj: GameObject) {
		if (obj instanceof LivingObject) {
			obj.damage(this.damage);
			console.log(this.damage)
		}
		this.delete();
	}


	getAmplitudeVec(): Vec2 {
		if (this.data.amplitude === 0 || this.data.frequency === 0) {
			return Vec2.Zero;
		}
		const vec = new Vec2((this.projNumber % 2 === 0 ? 1 : -1) * Math.sin(((this._currLifetime / this.data.lifetime) * Math.PI * 2) * this.data.frequency) * this.data.amplitude, 0).rotate(this.angle * (Math.PI / 180));
		return vec;
	}

	/**
	 * Returns the distance a projectile travels in 1ms.
	 */
	getSpeed() {
		return this.data.speed / 10000 + (this.accelerationSpeed / 1000);
	}

	update(elapsed: number) {
		this._currLifetime += elapsed;
		if (this._currLifetime > this.data.lifetime) {
			this.delete();
		}

		if (this.data.acceleration !== 0 && this._currLifetime > this.data.accelerationDelay) {
			this.accelerationSpeed += (this.data.acceleration / 10000) * elapsed;
			if (this.data.speedClamp !== undefined) {
				if (this.data.acceleration <= 0 && (this.data.speed / 10000) + this.accelerationSpeed < this.data.speedClamp / 10000) {
					this.accelerationSpeed = (this.data.speedClamp - (this.data.speed)) / 10;
				}
				if ((this.data.speed / 10000) + (this.accelerationSpeed ) >= this.data.speedClamp / 10000) {
					this.accelerationSpeed = (this.data.speedClamp - (this.data.speed)) / 10;
				}
			}
		}

		let moveVec = new Vec2(0, this.getSpeed() * elapsed);
		if (this.data.boomerang && this._currLifetime > this.data.lifetime / 2) {
			moveVec = moveVec.mult(new Vec2(-1, -1));
		}
		// (document.getElementById("test") as HTMLElement).innerText = moveVec.toString()
		this.move(moveVec.rotate(this.angle * (Math.PI / 180)));
	}

	getRenderAngle() {
		return this.angle + 90 + (this.renderData?.angleCorrection === 1 ? 45 : 0) + (this.renderData?.rotation !== undefined ? this.renderData.rotation * (this._currLifetime / 1000) : 0);
	}

	getModelViewMatrix() {
		const mat = super.getModelViewMatrix();
		// mat4.rotateZ(mat, mat, (-this.angle - (this.renderData?.angleCorrection === 1 ? 45 : 0)) * (Math.PI / 180));
		return mat;
	}

	getProgram(manager: AssetManager) {
		return manager.get<WebGLProgram>("programs", "textured")?.value;
	}
}