import { mat4 } from "gl-matrix";
import AssetManager from "../../engine/asset/AssetManager";
import { ProgramMap } from "../../engine/asset/ProgramAssetLoader";
import Rect from "../../engine/logic/Rect";
import Vec2 from "../../engine/logic/Vec2";
import GameObject, { RenderPriority } from "../../engine/obj/GameObject";
import RotMGAssets from "../asset/RotMGAssets";
import Projectile from "../data/Projectile";
import RotMGGame from "../RotMGGame";
import PlayerObject from "./PlayerObject";
import RotMGObject from "./RotMGObject";

export default class ProjectileObject extends RotMGObject {
	data: Projectile;
	angle: number = 0;
	lifetime: number = 1000;
	private _currLifetime = 0;

	constructor(pos: Vec2, data: Projectile, angle: number) {
		super();
		this.data = data;
		this.renderPriority = RenderPriority.High;
		this.updatePosition(pos);
		this.angle = angle;
	}

	onAddedToScene() {
		this.setData(this.data);
	}

	getCollisionBox() {
		return new Rect(this.position.x, this.position.y, 0.8, 0.8);
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

	onCollision() {
		this.delete();
	}

	update(elapsed: number) {
		this._currLifetime += elapsed;
		if (this._currLifetime > this.lifetime) {
			this.delete();
		}
		this.move(new Vec2(0, 0.1).rotate(this.angle * (Math.PI / 180)));
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