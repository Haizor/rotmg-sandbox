import { mat4 } from "gl-matrix";
import AssetManager from "../../engine/asset/AssetManager";
import { ProgramMap } from "../../engine/asset/ProgramAssetLoader";
import Vec2 from "../../engine/logic/Vec2";
import { GLSprite, RenderPriority } from "../../engine/obj/GameObject";
import RenderInfo from "../../engine/RenderInfo";
import Wall from "../data/Wall";
import RotMGGame from "../RotMGGame";
import RotMGObject from "./RotMGObject";

export default class WallTile extends RotMGObject {
	top: GLSprite | undefined;
	sides: GLSprite | undefined;
	data: Wall;

	constructor(pos: Vec2, data: Wall) {
		super();
		this.renderPriority = RenderPriority.Low;
		this.data = data;
		this.updatePosition(pos);
	}

	//TODO: this is a hacky fix
	onAddedToScene() {
		this.setData(this.data);
	}

	preventsMovement() {
		return false;
	}

	setData(data: Wall) {
		this.data = data;

		const rotmg = this.getGame() as RotMGGame;
		this.top = rotmg.renderHelper?.getSpriteFromTexture(this.data.top);
		this.sides = rotmg.renderHelper?.getSpriteFromTexture(this.data.texture);
	}

	render(info: RenderInfo) {
		if (this.scene === null) {
			return;
		}

		const top = this.top || this.sprite;
		const side = this.sides || this.sprite;

		if (top === undefined || side === undefined) {
			return;
		}

		const positions = [
			// Top face
			-0.5,  0.5,  0.5,
			0.5,  0.5,  0.5,
			0.5,  -0.5,  0.5,
			-0.5,  -0.5,  0.5,
		  
			// Bottom face
			-0.5, -0.5, -0.5,
			-0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5,
			 0.5, -0.5, -0.5,
		  
			// Front face
			-0.5,  0.5, 0.5,
			0.5,  0.5,  0.5,
			0.5,  0.5, -0.5,
			-0.5,  0.5, -0.5,
		  
			// Back face
			0.5, -0.5, 0.5,
			-0.5, -0.5, 0.5,
			-0.5, -0.5, -0.5,
			0.5, -0.5, -0.5,
		  
			// Left face
			 0.5, 0.5, 0.5,
			 0.5, -0.5, 0.5,
			 0.5, -0.5, -0.5,
			 0.5, 0.5,  -0.5,
		  
			// Right face
			-0.5, -0.5, 0.5,
			-0.5, 0.5, 0.5,
			-0.5, 0.5, -0.5,
			-0.5, -0.5, -0.5,
		];

		const { gl, manager, program } = info;
		const posBuffer = manager.bufferManager.getBuffer();
		const texPosBuffer = manager.bufferManager.getBuffer();


		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		gl.vertexAttribPointer(
			gl.getAttribLocation(program, "aVertexPosition"),
			3,
			gl.FLOAT,
			false,
			0,
			0
		)
		gl.enableVertexAttribArray(gl.getAttribLocation(program, "aVertexPosition"))

		const textureCoords = [
			...this.coordsFromSprite(top),
			...this.coordsFromSprite(top),
			...this.coordsFromSprite(side),
			...this.coordsFromSprite(side),
			...this.coordsFromSprite(side),
			...this.coordsFromSprite(side)
		]

		gl.bindBuffer(gl.ARRAY_BUFFER, texPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "aTextureCoord"), 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(gl.getAttribLocation(program, "aTextureCoord"))

		const indices = [
			0,  1,  2,      0,  2,  3,    // front
			4,  5,  6,      4,  6,  7,    // back
			8,  9,  10,     8,  10, 11,   // top
			12, 13, 14,     12, 14, 15,   // bottom
			16, 17, 18,     16, 18, 19,   // right
			20, 21, 22,     20, 22, 23,   // left
		];

		const indexBuffer = info.manager.bufferManager.getBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

		const mat = mat4.create();
		mat4.translate(mat, mat, [this.position.x, this.position.y, 1])

		gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, mat);
		gl.uniform4f(gl.getUniformLocation(program, "uColor"), this.tint.r, this.tint.g, this.tint.b, this.tint.a);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.top?.texture.texture as WebGLTexture)
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		{
			const offset = 0;
			const vertexCount = 36;
			gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
		}

		manager.bufferManager.finish();
	}

	coordsFromSprite(sprite: GLSprite) {
		const spriteLeft = sprite.rect.x;
		const spriteRight = sprite.rect.x + sprite.rect.w;
		const spriteTop = sprite.rect.y;
		const spriteBottom = sprite.rect.y + sprite.rect.h;

		const width = sprite.texture.size.x;
		const height = sprite.texture.size.y;

		return [
			spriteRight / width, spriteTop / height,
			spriteLeft / width, spriteTop / height, 
			spriteLeft / width, spriteBottom / height, 
			spriteRight / width, spriteBottom / height
		]
	}
	
	getProgram(manager: AssetManager): WebGLProgram | undefined {
		return manager.get<ProgramMap>("programs").get("textured");
	}
}