import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import { mat4, vec2 } from "gl-matrix";
import RotMGGame from "../RotMGGame";
import RotMGObject from "./RotMGObject";

export default class DamageText extends RotMGObject {
	moveSpeed = -100;
	lifetime = 1000;
	amount: number;
	renderPos: Vec2 = Vec2.Zero;

	constructor(pos: Vec2, amount: number) {
		super();
		this.updatePosition(pos);
		this.amount = amount;
	}

	canCollideWith() {
		return false;
	}

	update(elapsed: number) {
		super.update(elapsed);
		const camera = this.scene?.camera;
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
			const text = `-${this.amount}`
			const color = Color.Red;

			const camera = this.scene.camera;
			const mat = mat4.mul(mat4.create(), camera.getProjectionMatrix(), camera.getViewMatrix());
			const clipSpacePos = vec2.transformMat4(vec2.create(), [this.position.x, this.position.y], mat);
			const canvasPos = new Vec2((clipSpacePos[0] + 1) * (ctx.canvas.width / 2) + this.renderPos.x, ((clipSpacePos[1] * -1) + 1) * (ctx.canvas.height / 2) + this.renderPos.y)

			ctx.font = `36px ChronoType`;
			
			const size = ctx.measureText(text);
			const outlineSize = 2;

			ctx.fillStyle = Color.Black.toHex();
			ctx.fillText(text, canvasPos.x - (size.width / 2) - outlineSize, canvasPos.y - outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) - outlineSize, canvasPos.y + outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) + outlineSize, canvasPos.y + outlineSize);
			ctx.fillText(text, canvasPos.x - (size.width / 2) + outlineSize, canvasPos.y - outlineSize);

			ctx.fillStyle = color.toHex()
			
			ctx.fillText(text, canvasPos.x - (size.width / 2), canvasPos.y);
		}

	}
}