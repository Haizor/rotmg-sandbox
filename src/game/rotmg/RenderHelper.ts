import AssetManager from "../engine/asset/AssetManager";
import { TextureMap } from "../engine/asset/TextureAssetLoader";
import Rect from "../engine/logic/Rect";
import Vec2 from "../engine/logic/Vec2";
import { GLSprite } from "../engine/obj/GameObject";
import GLTextureInfo from "../engine/webgl/GLTextureInfo";
import { Action, Direction, Sprite } from "./asset/atlas/Spritesheet";
import RotMGAssets from "./asset/RotMGAssets";
import { TextureProvider, Texture, AnimatedTexture } from "./data/Texture";
import XMLObject from "./data/XMLObject";

export default class RenderHelper {
	manager: AssetManager;
	
	constructor(manager: AssetManager) {
		this.manager = manager;
	}

	getSpriteFromTexture(texture: TextureProvider | undefined, direction = Direction.Front, action = Action.Walk, time: number = 0): GLSprite | undefined {
		if (texture === undefined) return undefined;
		let sprite: Sprite | undefined;
		const textureData = texture.getTexture(time);
		if (textureData.animated) {
			sprite = this.manager.get<Sprite>("sprites", {
				texture: textureData,
				direction,
				action
			})?.value;
		} else {
			sprite = this.manager.get<Sprite>("sprites", {
				texture: textureData
			})?.value;
		}
		if (sprite === undefined) return undefined;
		const textureWebGL = this.manager.get<GLTextureInfo>("textures", "spriteAtlas/" + sprite.atlasId)?.value;
		if (textureWebGL === undefined) return undefined;
		return {
			texture: textureWebGL, 
			rect: this.fromSprite(sprite)
		}
	}

	getSpriteFromObject(obj: XMLObject | undefined, direction = Direction.Front, action = Action.Walk): GLSprite | undefined {
		if (obj === undefined) return undefined;
		return this.getSpriteFromTexture(obj.texture, direction, action);
	}

	getSpritesFromObject(obj: XMLObject | undefined, direction = Direction.Front, action = Action.Walk): GLSprite[] {
		if (obj === undefined || obj.texture === undefined) return [];
		const texture = obj.texture.getTexture(0);
		let sprites: (Sprite | undefined)[] | undefined;
		if (texture.animated) {
			sprites = this.manager.get<Sprite[]>("sprites", {
				texture,
				direction,
				action,
				animated: true,
				multiple: true
			})?.value;
		} else {
			const sprite = this.manager.get<Sprite>("sprites", {
				texture,
				direction,
				action
			})?.value;
			sprites = [sprite]
		}

		if (sprites === undefined) {
			return [];
		}

		const glSprites: GLSprite[] = [];
		for (let sprite of sprites) {
			if (sprite === undefined) continue;
			const texture = this.manager.get<GLTextureInfo>("textures", "spriteAtlas/" + sprite.atlasId)?.value;
			if (texture === undefined) continue;
			const rect = this.fromSprite(sprite);
			let sizeMod;
			if (rect.w > rect.h) {
				sizeMod = new Vec2(2, 1);
			}
			glSprites.push({
				rect: this.fromSprite(sprite),
				texture,
				sizeMod
			})
		}
		return glSprites;
	}

	fromSprite(sprite: Sprite) {
		return new Rect(sprite.position.x, sprite.position.y, sprite.position.w, sprite.position.h);
	}
}