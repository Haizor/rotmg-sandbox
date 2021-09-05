import AssetManager from "common/asset/normal/AssetManager";
import { Action, Direction } from "common/asset/rotmg/atlas/NewSpritesheet";
import ObjectClass from "common/asset/rotmg/data/ObjectClass";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import { mat4 } from "gl-matrix";
import { AnimatedTexture, BasicTexture, TextureProvider } from "../../../common/asset/rotmg/data/Texture";
import Color from "../../engine/logic/Color";
import Rect from "../../engine/logic/Rect";
import Vec3 from "../../engine/logic/Vec3";
import GameObject, { GLSprite } from "../../engine/obj/GameObject";
import RenderInfo from "../../engine/RenderInfo";
import type RotMGGame from "../RotMGGame";

export default class RotMGObject extends GameObject {
	sprite?: GLSprite;
	flipSprite: boolean = false;
	tint: Color = new Color(1.0, 1.0, 1.0, 1.0);
	outlineSize: number = 0.005;
	time: number = 0;
	xmlData?: XMLObject;
	texture?: TextureProvider;
	action: Action = Action.Walk;
	direction: Direction = Direction.Side;
	frameSwitchDelay: number = -1;

	constructor(data?: XMLObject) {
		super();
		this.z = 1;
		this.xmlData = data;
	}

	canCollideWith(obj: GameObject) {
		if (this.xmlData !== undefined && this.xmlData.class === ObjectClass.GameObject) {
			return false;
		}
		return super.canCollideWith(obj);
	}

	update(elapsed: number) {
		super.update(elapsed);
		this.time += elapsed;
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
		const ratio = (gl.canvas.width / gl.canvas.height)

		draw(modelViewMatrix, Color.Black, new Vec3(-this.outlineSize / ratio, this.outlineSize, 0.0001));
		draw(modelViewMatrix, Color.Black, new Vec3(-this.outlineSize / ratio, -this.outlineSize, 0.0001));		
		draw(modelViewMatrix, Color.Black, new Vec3(this.outlineSize / ratio, -this.outlineSize, 0.0001));		
		draw(modelViewMatrix, Color.Black, new Vec3(this.outlineSize / ratio, this.outlineSize, 0.0001));
		draw(modelViewMatrix, this.tint);

		manager.bufferManager.finish();
	}

	getSprite(): GLSprite | undefined {
		const game = this.getGame() as RotMGGame;
		if (!("renderHelper" in game)) return;

		if (this.xmlData !== undefined) {
			if (this.texture === undefined && this.sprite === undefined) {
				this.texture = this.xmlData.texture;
			}
		}

		if (this.sprite !== undefined) {
			return this.sprite;
		}

		const sprites = game.renderHelper?.getSpritesFromObject(this.xmlData, {
			action: this.action,
			direction: this.direction
		})

		if (sprites === undefined || sprites.length === 0) return;

		if (this.frameSwitchDelay !== -1 && this.texture instanceof BasicTexture && this.texture.animated) {
			if (sprites !== undefined) {
				const animTime = this.frameSwitchDelay;
				const length = sprites.length;

				const index = (this.time % animTime / (animTime / length));

				return sprites[Math.floor(index)]
			}

		}

		return sprites[0];
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

	getRenderRect(): Rect {
		return Rect.Zero.expand(1, 1);
	}

	getParticleColor(): Color {
		const sprite = this.getSprite();
		if (sprite !== undefined && sprite.data !== undefined) {
			const common = sprite.data.mostCommonColor;
			return new Color(common.r / 255, common.g / 255, common.b / 255, 1);
		}
		return Color.Red;
	}

	getParticleProb(): number {
		return 1;
	}

	//TODO: refactor
	getVerts(sprite: GLSprite | undefined): number[] {
		let renderRect = this.getRenderRect();

		if (sprite?.sizeMod !== undefined) {
			const extraW = renderRect.w * sprite.sizeMod.x - renderRect.w;
			const extraH = renderRect.h * sprite.sizeMod.y - renderRect.h;

			renderRect = renderRect.expand(extraW, extraH);
			if (sprite.sizeMod.x / sprite.sizeMod.y !== 1) {
				
				renderRect.pos.x -= (renderRect.w / 4) * (this.flipSprite ? -1 : 1);
			}
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

		const width = sprite.texture.size.width;
		const height = sprite.texture.size.height;

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
		return manager.get<WebGLProgram>("programs", "billboard")?.value;
	}
}