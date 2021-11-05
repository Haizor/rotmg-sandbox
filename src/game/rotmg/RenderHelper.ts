import AssetManager from "common/asset/normal/AssetManager";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
import { Action, Direction, Sprite, SpriteData } from "common/asset/rotmg/atlas/NewSpritesheet";
import { TextureProvider } from "../../common/asset/rotmg/data/Texture";
import XMLObject from "../../common/asset/rotmg/data/XMLObject";
import Rect from "../engine/logic/Rect";
import Vec2 from "../engine/logic/Vec2";
import { GLSprite } from "../engine/obj/GameObject";

export type RenderOptions = {
	time?: number;
	action?: Action;
	direction?: Direction;
}

const textureCache: Map<string, GLSprite> = new Map();

export default class RenderHelper {
	manager: AssetManager;
	gl: WebGLRenderingContext;
	
	constructor(manager: AssetManager, gl: WebGLRenderingContext) {
		this.manager = manager;
		this.gl = gl;
	}

	getSpriteFromTexture(texture: TextureProvider | undefined, options?: RenderOptions): GLSprite | undefined {
		if (texture === undefined) return;
		const textureData = texture?.getTexture(options?.time ?? 0)
		const path = `${textureData.file}/${textureData.index}/${options?.time ?? 0}`

		if (textureCache.has(path)) {
			return textureCache.get(path);
		}

		const time = options?.time ?? 0;

		const getResult = this.manager.get<Sprite>("sprites", {
			texture: texture?.getTexture(time ?? 0),
			direction: options?.direction,
			action: options?.action
		});
		const sprite = getResult?.value;

		if (sprite === undefined) return;
		if (sprite.getGLTexture() === undefined) {
			if (getResult?.container instanceof CustomSpritesheet) {
				getResult.container.initGL(this.gl);
				getResult.container.updateTexture();
			}
		}
		const glTexture = sprite.getGLTexture();
		if (glTexture === undefined) {
			return;
		}
		const data = sprite.getData();
		const sizeMod = new Vec2(data.position.w / data.position.h, 1)

		const result = {
			texture: glTexture,
			rect: this.fromSprite(data),
			data,
			sizeMod
		}
		textureCache.set(path, result);
		return result;
	}

	getSpriteFromObject(obj: XMLObject | undefined, options?: RenderOptions): GLSprite | undefined {
		return this.getSpriteFromTexture(obj?.texture, options);
	}

	getSpritesFromObject(obj: XMLObject | undefined, options?: RenderOptions): GLSprite[] {
		const texture = obj?.texture;
		const time = options?.time ?? 0;

		const sprites = this.manager.get<Sprite[]>("sprites", {
			texture: texture?.getTexture(time ?? 0),
			direction: options?.direction,
			action: options?.action,
			multiple: true
		})?.value;
		if (sprites === undefined || sprites[0] === undefined) return [];
		const glTexture = sprites[0].getGLTexture();
		if (glTexture === undefined) return [];
		return sprites.map((sprite) => {
			const data = sprite.getData();
			const sizeMod = new Vec2(data.position.w / 8, data.position.h / 8)

			return {
				texture: glTexture,
				rect: this.fromSprite(sprite.getData()),
				data,
				sizeMod
			}
		})
	}

	fromSprite(sprite: SpriteData) {
		return new Rect(sprite.position.x, sprite.position.y, sprite.position.w, sprite.position.h);
	}
}