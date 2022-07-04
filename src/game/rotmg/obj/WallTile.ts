import RotMGObject from "./RotMGObject";
import { mat4 } from "gl-matrix";
import Rect from "../../engine/logic/Rect";
import Vec2 from "../../engine/logic/Vec2";
import { RenderPriority } from "../../engine/obj/GameObject";
import RenderInfo from "../../engine/RenderInfo";
import { Wall, AssetManager, Sprite } from "@haizor/rotmg-utils";
import { RenderHelper } from "../RenderHelper";

const COLLISION_RECT = Rect.Zero.expand(1, 1);

export default class WallTile extends RotMGObject<Wall> {
	private _indexBuffer: WebGLBuffer | undefined;

	private _top?: Sprite;

	constructor(pos: Vec2, data: Wall) {
		super(data);
		this.renderPriority = RenderPriority.Low;
		this.updatePosition(pos);
		this.addTag("wall")
	}

	//TODO: this is a hacky fix
	onAddedToScene() {
		this.setData(this.xmlData as Wall);
	}

	getCollisionBox() {
		return COLLISION_RECT.copy();
	}

	preventsMovement() {
		return true;
	}

	updateSprites(): void {
		const game = this.getGame();
		if (game === undefined || game.renderHelper === undefined) return;
		this.sprites = game.renderHelper.getSpritesFromObject(this.xmlData);
		this._top = game.renderHelper.getSpritesFromTexture(this.xmlData?.top)[0];
	}

	setData(data: Wall) {
		this.xmlData = data;
		this.updateSprites();
	}

	render(info: RenderInfo) {
		const sprite = this.getSprite();

		if (sprite === undefined) {
			return;
		}

		const positions = [
			// Top face
			-0.505,  0.505,  0.505,
			0.505,  0.505,  0.505,
			0.505,  -0.505,  0.505,
			-0.505,  -0.505,  0.505,
		
		  
			// Front face
			-0.505,  0.505, 0.505,
			0.505,  0.505,  0.505,
			0.505,  0.505, -0.505,
			-0.505,  0.505, -0.505,
		  
			// Back face
			0.505, -0.505, 0.505,
			-0.505, -0.505, 0.505,
			-0.505, -0.505, -0.505,
			0.505, -0.505, -0.505,
		  
			// Left face
			 0.505, 0.505, 0.505,
			 0.505, -0.505, 0.505,
			 0.505, -0.505, -0.505,
			 0.505, 0.505,  -0.505,
		  
			// Right face
			-0.505, -0.505, 0.505,
			-0.505, 0.505, 0.505,
			-0.505, 0.505, -0.505,
			-0.505, -0.505, -0.505,
		];

		const textureCoords = [
			...this.getSpriteVerts(this._top ?? sprite),
			...this.getSpriteVerts(sprite),
			...this.getSpriteVerts(sprite),
			...this.getSpriteVerts(sprite),
			...this.getSpriteVerts(sprite)
		]

		const { gl, programInfo } = info;
		const { attribs, uniforms, program } = programInfo;

		const helper = this.getGame()?.renderHelper as RenderHelper;

		const texture = helper.getTexture(sprite);
		
		if (!this._indexBuffer) {
			this._indexBuffer = gl.createBuffer() as WebGLBuffer;
		}

		gl.useProgram(program);

		gl.uniform2f(uniforms["uTextureRes"], texture.width, texture.height)

		const pos = attribs["aVertexPosition"];
		gl.bindBuffer(gl.ARRAY_BUFFER, pos.buffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		gl.vertexAttribPointer(
			pos.location,
			3,
			gl.FLOAT,
			false,
			0,
			0
		)

		const texPos = attribs["aTextureCoord"]
		gl.bindBuffer(gl.ARRAY_BUFFER, texPos.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(texPos.location, 2, gl.FLOAT, false, 0, 0);

		const indices = [
			0,  1,  2,      0,  2,  3,    // front
			4,  5,  6,      4,  6,  7,    // back
			8,  9,  10,     8,  10, 11,   // top
			12, 13, 14,     12, 14, 15,   // bottom
			16, 17, 18,     16, 18, 19,   // right
			20, 21, 22,     20, 22, 23,   // left
		];

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

		gl.uniformMatrix4fv(uniforms["uModelViewMatrix"], false, this.getModelViewMatrix());
		gl.uniform4f(uniforms["uColor"], this.tint.r, this.tint.g, this.tint.b, this.tint.a);
		gl.bindTexture(gl.TEXTURE_2D, texture.texture);
		{
			const offset = 0;
			const vertexCount = 36;
			gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
		}

		// manager.bufferManager.finish();
	}

	getModelViewMatrix() {
		const mat = mat4.create();
		mat4.translate(mat, mat, [this.position.x, this.position.y, 1])
		mat4.scale(mat, mat, [1, 1, 2])
		return mat;
	}

	getSpriteVerts(sprite: Sprite): number[] {
		const { x, y, w, h } = sprite.getData().position;

		return [
			x + w, y,
			x, y,
			x, y + h,
			x + w, y + h
		]
	}

	getProgramName(): string {
		return "textured"
	}
}