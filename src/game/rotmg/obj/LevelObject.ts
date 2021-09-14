import AssetManager from "common/asset/normal/AssetManager";
import Ground from "common/asset/rotmg/data/Ground";
import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import Vec3 from "game/engine/logic/Vec3";
import { GLSprite } from "game/engine/obj/GameObject";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import RotMGObject from "./RotMGObject";

export default class LevelObject extends RotMGObject {
	verts: Float32Array;
	buffer?: WebGLBuffer;

	constructor(position: Vec2, data: Ground) {
		super(data);
		console.log(data)
		this.position = position;
		this.z = 0;
		this.verts = new Float32Array(this.getVerts())
	}

	getBuffer(gl: WebGLRenderingContext): WebGLBuffer {
		if (this.buffer === undefined) {
			const buffer = gl.createBuffer();
			if (buffer === null) {
				throw new Error("Failed to create buffer!");
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW)
			this.buffer = buffer;
		}
		return this.buffer;
	}

	render(info: RenderInfo) {
		if (this.scene === null) {
			return;
		}

		const { gl, manager, program } = info;
		const posBuffer = this.getBuffer(gl);
		const texPosBuffer = manager.bufferManager.getBuffer();

		const sprite = this.getSprite() as GLSprite;
		const textureCoords = this.coordsFromSprite(sprite);

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.vertexAttribPointer(
			gl.getAttribLocation(program, "aVertexPosition"),
			2,
			gl.FLOAT,
			false,
			0,
			0
		)
		gl.enableVertexAttribArray(gl.getAttribLocation(program, "aVertexPosition"))

		gl.bindBuffer(gl.ARRAY_BUFFER, texPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "aTextureCoord"), 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(gl.getAttribLocation(program, "aTextureCoord"))

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sprite.texture.texture)
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		const draw = (matrix: mat4, color: Color, offset: Vec3 = Vec3.Zero) => {
			gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, matrix);
			gl.uniform3f(gl.getUniformLocation(program, "uOffset"), offset.x, offset.y, offset.z);
			gl.uniform4f(gl.getUniformLocation(program, "uColor"), color.r, color.g, color.b, color.a);

			{
				const offset = 0;
				const vertexCount = this.verts.length;
				gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
			}
		}

		const modelViewMatrix = this.getModelViewMatrix();

		const oColor = Color.Black;
		oColor.a = this.tint.a !== 1.0 ? 0.5 : 1;

		draw(modelViewMatrix, this.tint);

		manager.bufferManager.finish();
	}

	coordsFromSprite(sprite: GLSprite) {
		function fix(nums: number[]) {
			for (let i = 0; i < nums.length; i += 2) nums[i] /= sprite.texture.size.width;
			for (let i = 1; i < nums.length; i += 2) nums[i] /= sprite.texture.size.height;
			return nums;
		}

		let nums: number[] = []
		for (let i = 0; i < this.verts.length / 6; i++) {
			nums = [...nums, ...sprite.rect.toTriangles()]
		}

		return fix(nums);
	}

	getVerts() {
		let verts: number[] = [];

		for (let x = 0; x < 20; x++) {
			for (let y = 0; y < 20; y++) {
				verts = [...verts, ...Rect.Zero.expand(1.01, 1.01).translate(x, y).toTriangles()]
			}
		}


		return verts;
	}

	getModelViewMatrix() {
		return mat4.create()
	}

	getProgram(manager: AssetManager) {
		return manager.get("programs", "textured")?.value as WebGLProgram;
	}
}