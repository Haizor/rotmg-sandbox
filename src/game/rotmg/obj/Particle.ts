import AssetManager from "common/asset/normal/AssetManager";
import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import RotMGObject from "./RotMGObject";

export default class Particle extends RotMGObject {
	lifetime: number = 0;
	color: Color = Color.Red;
	scale: number = 1.2;
	movement: Vec2 = Vec2.Zero;

	constructor(position: Vec2, lifetime: number, color: Color, delta?: Vec2) {
		super();
		this.position = position;
		this.lifetime = lifetime;
		this.color = color;
		if (delta !== undefined) this.movement = delta;
	}

	update(elapsed: number) {
		super.update(elapsed);

		this.move(this.movement.mult(new Vec2(0.001 * elapsed, 0.001 * elapsed)))
		
		if (this.lifetime < this.time) {
			this.delete();
		}
	}

	collidesWith() { return false; }
	canCollideWith() { return false; }

	render(info: RenderInfo) {
		const { gl, program } = info;

		const posBuffer = info.manager.bufferManager.getBuffer();
		const base = Rect.Zero.expand(0.1, 0.1);
		const outline = Rect.Zero.expand(0.15, 0.15);

		const draw = (rect: Rect, color: Color) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rect.toVerts(false)), gl.STATIC_DRAW);
			gl.vertexAttribPointer(
				gl.getAttribLocation(program, "aVertexPosition"),
				2,
				gl.FLOAT,
				false,
				0,
				0
			)

			gl.enableVertexAttribArray(gl.getAttribLocation(program, "aVertexPosition"));
			gl.uniform4f(gl.getUniformLocation(program, "uColor"), color.r, color.g, color.b, color.a);
			gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, this.getModelViewMatrix());
			{
				const offset = 0;
				const vertexCount = 4;
				gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
			}
		}

		draw(outline, Color.Black);
		draw(base, this.color);


		info.manager.bufferManager.finish()
	}

	getModelViewMatrix() {
		const mat = mat4.create();

		mat4.translate(mat, mat, [this.position.x, this.position.y, this.z])
		mat4.scale(mat, mat, [this.scale, this.scale, 1]);

		return mat;
	}

	getProgram(manager: AssetManager) {
		return manager.get<WebGLProgram>("programs", "billboard/color")?.value;
	}
}