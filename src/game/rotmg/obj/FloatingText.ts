import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import { mat4, vec2 } from "gl-matrix";
import RotMGGame from "../RotMGGame";
import { DamageSource } from "./DamageSource";
import RotMGObject from "./RotMGObject";

export default class FloatingText extends RotMGObject {
	moveSpeed = -100;
	lifetime = 1000;
	text: string;
	renderPos: Vec2 = Vec2.Zero.subtract(new Vec2(0, 75));
	target: GameObject;

	constructor(target: GameObject, color: Color, text: string) {
		super();
		this.target = target;
		this.text = text;
		this.color = color;
	}

	canCollideWith() {
		return false;
	}

	update(elapsed: number) {
		super.update(elapsed);
		this.position = (this.target.position);

		const moveVec = new Vec2(0, (this.moveSpeed / 1000) * elapsed);

		this.renderPos = this.renderPos.add(moveVec)
		if (this.time > this.lifetime) {
			this.delete();
		}
	}

	render() {
		if (this.scene === null) return;
		
		const game = this.scene.game as RotMGGame;
		const ctx = game.ctx;

		if (ctx !== null) {
			const { text } = this;
			const fontSize = 40 + Math.max(0, (100 - this.time) / 5);

			const camera = this.scene.camera;
			const mat = mat4.mul(mat4.create(), camera.getProjectionMatrix(), camera.getViewMatrix());
			const clipSpacePos = vec2.transformMat4(vec2.create(), [this.position.x, this.position.y], mat);
			const canvasPos = new Vec2((clipSpacePos[0] + 1) * (ctx.canvas.width / 2) + this.renderPos.x, ((clipSpacePos[1] * -1) + 1) * (ctx.canvas.height / 2) + this.renderPos.y)

			ctx.font = `${fontSize}px ChronoType`;
			
			const size = ctx.measureText(text);
			const outlineSize = 2;

			ctx.fillStyle = Color.Black.toHex();
			ctx.fillText(text, canvasPos.x - (size.width / 2) - outlineSize, canvasPos.y - outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) - outlineSize, canvasPos.y + outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) + outlineSize, canvasPos.y + outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) + outlineSize, canvasPos.y - outlineSize);

			ctx.fillStyle = this.color.toHex()
			
			ctx.fillText(text, canvasPos.x - (size.width / 2), canvasPos.y);
		}

	}

	static fromDamageSource(target: GameObject, source: DamageSource<any>) {
		return new FloatingText(target, source.ignoreDef === true ? Color.Purple : Color.Red, `-${source.amount}`)
	}
}