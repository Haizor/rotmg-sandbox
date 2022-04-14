import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import { Decoy } from "rotmg-utils";
import PlayerObject from "./PlayerObject";
import RotMGObject from "./RotMGObject";

export type DecoyObjectOptions = {
	data: Decoy;
	source: PlayerObject;
	direction: Vec2;
}

export default class DecoyObject extends RotMGObject {
	data: Decoy;
	source: PlayerObject;
	moveDirection: Vec2;
	startPos: Vec2;

	constructor(options: DecoyObjectOptions) {
		super(options.source.data);
		this.addTag("player")
		this.data = options.data;
		this.position = options.source.position;
		this.startPos = this.position;
		this.source = options.source;
		this.moveDirection = options.direction;
	}

	canCollideWith(obj: GameObject) {
		return !obj.hasTag("projectile") && !obj.hasTag("player") && !obj.hasTag("enemy");
	}

	preventsMovement() {
		return false;
	}

	update(elapsed: number) {
		super.update(elapsed);
		if (Vec2.dist(this.startPos, this.position) < this.data.distance) {
			this.move(this.moveDirection.mult(0.001 * elapsed * this.data.speed * 5))
		}

		if (this.time > this.data.duration * 1000) {
			this.delete();
		}
	}
}