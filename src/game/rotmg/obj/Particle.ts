import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import Vec3 from "game/engine/logic/Vec3";
import GameObject from "game/engine/obj/GameObject";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import { AssetManager } from "@haizor/rotmg-utils";
import RotMGObject from "./RotMGObject";

export type ParticleOptions = {
	target: Vec2 | GameObject;
	lifetime: number;
	color: Color;
	scale?: number;
	delta?: Vec3;
	offset?: Vec2;
}

export default class Particle extends RotMGObject {
	lifetime: number = 0;
	color: Color = Color.Red;
	scale: number = 1.2;
	movement: Vec3 = Vec3.Zero;
	offset: Vec2 = Vec2.Zero;
	basePosition?: Vec2;
	target?: GameObject;
	matrix: mat4 = mat4.create();

	static base = new Float32Array(Rect.Zero.expand(0.1, 0.1).toVerts(false));
	static outline = new Float32Array(Rect.Zero.expand(0.12, 0.12).toVerts(false));

	constructor(options: ParticleOptions) {
		super();

		if (options.target instanceof Vec2) {
			this.position = options.target;
			this.basePosition = this.position;
		} else {
			this.position = options.target.position;
			this.target = options.target;
			this.offset = options.offset ?? Vec2.Zero
		}
		this.scale = options.scale ?? 1.2;
		this.lifetime = options.lifetime;
		this.color = options.color;

		if (options.delta !== undefined) this.movement = options.delta;
	}

	update(elapsed: number) {
		super.update(elapsed);

		this.offset = this.offset.add(new Vec2(this.movement.x * 0.001 * elapsed, this.movement.y * 0.001 * elapsed))
		this.z += this.movement.z * 0.001 * elapsed;

		if (this.target !== undefined) {
			this.position = this.target.position.add(this.offset);
		} else if (this.basePosition !== undefined) {
			this.position = this.basePosition.add(this.offset);
		}
		
		if (this.lifetime < this.time) {
			this.delete();
		}
	}

	collidesWith() { return false; }
	canCollideWith() { return false; }

	hasCollision() {
		return false;
	}

	render(info: RenderInfo) {
		const { gl, programInfo } = info;
		const { attribs, uniforms, program } = programInfo;

		const pos = attribs["aVertexPosition"];

		const draw = (verts: Float32Array, color: Color) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, pos.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
			gl.vertexAttribPointer(
				pos.location,
				2,
				gl.FLOAT,
				false,
				0,
				0
			)

			gl.uniform4f(uniforms["uColor"], color.r, color.g, color.b, color.a);
			gl.uniformMatrix4fv(uniforms["uModelViewMatrix"], false, this.getModelViewMatrix());
			{
				const offset = 0;
				const vertexCount = 4;
				gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);
			}
		}

		draw(Particle.outline, Color.Black);
		draw(Particle.base, this.color);
	}

	getModelViewMatrix() {
		const mat = this.matrix;
		mat4.identity(mat);
		const currentScale = this.scale - this.scale * (this.time / this.lifetime)

		mat4.translate(mat, mat, [this.position.x, this.position.y, this.z])
		mat4.scale(mat, mat, [currentScale, currentScale, 1]);

		return mat;
	}

	getProgram(manager: AssetManager) {
		return manager.get<WebGLProgram>("programs", "billboard/color")?.value;
	}

	getProgramName() {
		return "billboard/color";
	}
}