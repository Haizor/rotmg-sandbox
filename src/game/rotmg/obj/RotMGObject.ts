import { mat4 } from "gl-matrix";
import AssetManager from "../../engine/asset/AssetManager";
import { ProgramMap } from "../../engine/asset/ProgramAssetLoader";
import Color from "../../engine/logic/Color";
import Rect from "../../engine/logic/Rect";
import Vec3 from "../../engine/logic/Vec3";
import GameObject, { GLSprite } from "../../engine/obj/GameObject";
import RenderInfo from "../../engine/RenderInfo";

export default class RotMGObject extends GameObject {
	sprite: GLSprite | undefined;
	flipSprite: boolean = false;
	tint: Color = new Color(1.0, 1.0, 1.0, 1.0);
	outlineSize: number = 0.005;

	constructor() {
		super();
		this.z = 1;
	}
	
	render(info: RenderInfo) {
		if (this.scene === undefined || this.getSprite() === undefined) {
			return;
		}

		const { gl, manager, program } = info;
		const posBuffer = manager.bufferManager.getBuffer();
		const texPosBuffer = manager.bufferManager.getBuffer();

		const sprite = this.getSprite() as GLSprite;
		const textureCoords = this.coordsFromSprite(sprite);
		const verts = this.getVerts(sprite);

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
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

		function draw(matrix: mat4, color: Color, offset: Vec3 = Vec3.Zero) {
			gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, matrix);
			gl.uniform3f(gl.getUniformLocation(program, "uOffset"), offset.x, offset.y, offset.z);
			gl.uniform4f(gl.getUniformLocation(program, "uColor"), color.r, color.g, color.b, color.a);

			{
				const offset = 0;
				const vertexCount = 4;
				gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
			}
		}

		const modelViewMatrix = this.getModelViewMatrix();

		draw(modelViewMatrix, Color.Black, new Vec3(-this.outlineSize, this.outlineSize, 0.01));
		draw(modelViewMatrix, Color.Black, new Vec3(-this.outlineSize, -this.outlineSize, 0.01));		
		draw(modelViewMatrix, Color.Black, new Vec3(this.outlineSize, -this.outlineSize, 0.01));		
		draw(modelViewMatrix, Color.Black, new Vec3(this.outlineSize, this.outlineSize, 0.01));
		draw(modelViewMatrix, this.tint);

		manager.bufferManager.finish();
	}

	getSprite(): GLSprite | undefined {
		return this.sprite;
	}

	getModelViewMatrix(): mat4 {
		const mat = mat4.create();

		mat4.translate(mat, mat, [this.position.x, this.position.y, this.z])
		mat4.scale(mat, mat, [0.8, 0.8, 1]);

		return mat;
	}

	getRenderAngle(): number {
		return 0;
	}

	//TODO: refactor
	getVerts(sprite: GLSprite | undefined): number[] {
		let renderRect = Rect.Zero.expand(1, 1)

		if (sprite?.sizeMod !== undefined) {
			const extraX = renderRect.size.x * sprite.sizeMod.x;
			const extraY = renderRect.size.y * sprite.sizeMod.y;
			if (!this.flipSprite) {
				if (sprite.sizeMod.x !== 1) renderRect.pos.x -= (extraX / 2);
				if (sprite.sizeMod.y !== 1) renderRect.pos.y -= (extraY / 2);
			}

			renderRect.size.x *= sprite.sizeMod.x;
			renderRect.size.y *= sprite.sizeMod.y;
		}

		let pos = renderRect.toVerts(this.flipSprite);
		const renderAngle = this.getRenderAngle();
		

		if (renderAngle !== 0) {
			const newPos = [];
			const rad = renderAngle * (Math.PI / 180);
			for (let i = 0; i <= pos.length; i += 2) {
				const x = pos[i];
				const y = pos[i + 1];
				const xA = (x * Math.sin(rad) - (y * Math.cos(rad)));
				const yA = (x * Math.cos(rad) + (y * Math.sin(rad)));
				newPos[i] = xA;
				newPos[i + 1] = yA;
			}
			return newPos;
		}

		return pos;
	}

	coordsFromSprite(sprite: GLSprite) {
		const spriteLeft = sprite.rect.x;
		const spriteRight = sprite.rect.x + sprite.rect.w;
		const spriteTop = sprite.rect.y;
		const spriteBottom = sprite.rect.y + sprite.rect.h;

		const width = sprite.texture.size.x;
		const height = sprite.texture.size.y;

		return [
			spriteRight / width, spriteBottom / height,
			spriteLeft / width, spriteBottom / height, 
			spriteRight / width, spriteTop / height, 
			spriteLeft / width, spriteTop / height
		]
	}

	getCollisionBox() {
		return Rect.Zero.expand(0.8, 0.8);
	}

	getProgram(manager: AssetManager): WebGLProgram | undefined {
		return manager.get<ProgramMap>("programs").get("billboard");
	}
}