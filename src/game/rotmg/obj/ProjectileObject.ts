import { mat4 } from "gl-matrix";
import AssetManager from "../../engine/asset/AssetManager";
import { ProgramMap } from "../../engine/asset/ProgramAssetLoader";
import Rect from "../../engine/logic/Rect";
import Vec2 from "../../engine/logic/Vec2";
import GameObject, { RenderPriority } from "../../engine/obj/GameObject";
import RotMGAssets from "../asset/RotMGAssets";
import Projectile from "../data/Projectile";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import PlayerObject from "./PlayerObject";
import RotMGObject from "./RotMGObject";

export default class ProjectileObject extends RotMGObject {
	data: Projectile;
	angle: number = 0;
	damage: number = 0;
	projNumber: number = 0;
	private _currLifetime = 0;

	get position() {
		return this._position.add(this.getAmplitudeVec());
	}

	set position(pos: Vec2) {
		this._position = pos;
	}

	constructor(pos: Vec2, data: Projectile, angle: number, projNumber = 0) {
		super();
		this.data = data;
		this.renderPriority = RenderPriority.High;
		this.updatePosition(pos);
		this.angle = angle;
		this.damage = data.getDamage();
		this.projNumber = projNumber;
	}

	onAddedToScene() {
		this.setData(this.data);
	}

	getCollisionBox() {
		const pos = this.position;
		return new Rect(pos.x, pos.y, 0.8, 0.8);
	}

	setData(data: Projectile) {
		this.data = data;
		const rotmg = this.getGame() as RotMGGame;
		const renderData = this.getAssetManager()?.get<RotMGAssets>("rotmg").getObjectFromId(data.objectId);
		this.sprite = rotmg.renderHelper?.getSpriteFromObject(renderData);
	} 

	canCollideWith(obj: GameObject) {
		return !(obj instanceof PlayerObject) && !(obj instanceof ProjectileObject);
	}

	collidesWith(newPos: Vec2, obj: GameObject) {
		return obj.getCollisionBox().translate(obj.position).contains(newPos);
	}

	preventsMovement() {
		return false;
	}

	getAmplitudeVec(): Vec2 {
		if (this.data.amplitude === 0 || this.data.frequency === 0) {
			return Vec2.Zero;
		}
		const vec = new Vec2((this.projNumber % 2 === 0 ? 1 : -1) * Math.sin(((this._currLifetime / this.data.lifetime) * Math.PI * 2) * this.data.frequency) * this.data.amplitude, 0).rotate(this.angle * (Math.PI / 180));
		return vec;
	}

	onCollision(obj: GameObject) {
		if (obj instanceof LivingObject) {
			obj.damage(this.damage);
		}
		this.delete();
	}

	update(elapsed: number) {
		this._currLifetime += elapsed;
		if (this._currLifetime > this.data.lifetime) {
			this.delete();
		}
		const moveVec = new Vec2(0, (this.data.speed / 10000) * elapsed);
		// (document.getElementById("test") as HTMLElement).innerText = moveVec.toString()
		this.move(moveVec.rotate(this.angle * (Math.PI / 180)));
	}

	getModelViewMatrix() {
		const mat = super.getModelViewMatrix();
		mat4.rotateZ(mat, mat, (-this.angle - 45) * (Math.PI / 180));
		return mat;
	}

	getProgram(manager: AssetManager) {
		return manager.get<ProgramMap>("programs").get("textured")
	}
}