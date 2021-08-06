import Vec2 from "../../engine/logic/Vec2";
import { RenderPriority } from "../../engine/obj/GameObject";
import Projectile from "../data/Projectile";
import RotMGGame from "../RotMGGame";
import RotMGObject from "./RotMGObject";

export default class ProjectileObject extends RotMGObject {
	data: Projectile;
	angle: number = 0;
	lifetime: number = 600;
	private _currLifetime = 0;
	constructor(pos: Vec2, data: Projectile) {
		super();
		this.data = data;
		this.renderPriority = RenderPriority.High;
		this.updatePosition(pos);
	}

	update(elapsed: number) {
		this._currLifetime += elapsed;
		if (this._currLifetime > this.lifetime) {
			this.delete();
		}
		this.move(new Vec2(0, -0.01));
	}

	collidesWith() {
		return false;
	}

	preventsMovement() {
		return false;
	}

	onAddedToScene() {
		this.setData(this.data);
	}

	setData(data: Projectile) {
		this.data = data;
		const rotmg = this.getGame() as RotMGGame;
		this.sprite = rotmg.renderHelper?.getSpriteFromObject(data);
	} 
}