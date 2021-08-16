import AssetManager from "common/asset/normal/AssetManager";
import Rect from "../engine/logic/Rect";
import Vec2 from "../engine/logic/Vec2";
import { GLSprite } from "../engine/obj/GameObject";
import { Action, Direction, Sprite, SpriteData, SpriteResult } from "../../common/asset/rotmg/atlas/Spritesheet";
import { TextureProvider } from "../../common/asset/rotmg/data/Texture";
import XMLObject from "../../common/asset/rotmg/data/XMLObject";
import { GLTextureInfo } from "common/asset/normal/loaders/TextureAssetLoader";

export default class RenderHelper {
	manager: AssetManager;
	
	constructor(manager: AssetManager) {
		this.manager = manager;
	}

	getSpriteFromTexture(texture: TextureProvider | undefined, direction = Direction.Front, action = Action.Walk, time: number = 0): GLSprite | undefined {
		if (texture === undefined) return undefined;
		let result: SpriteResult | undefined;
		const textureData = texture.getTexture(time);
		if (textureData.animated) {
			result = this.manager.get<SpriteResult>("sprites", {
				texture: textureData,
				direction,
				action,
				giveTexture: true
			})?.value;
		} else {
			result = this.manager.get<SpriteResult>("sprites", {
				texture: textureData,
				giveTexture: true
			})?.value;
		}
		if (result === undefined || (result as any).sprite  === undefined) return undefined;
		const textureWebGL = (result as any).texture;
		if (textureWebGL === undefined) return undefined;
		return {
			texture: textureWebGL, 
			rect: this.fromSprite((result as any).sprite)
		}
	}

	getSpriteFromObject(obj: XMLObject | undefined, direction = Direction.Front, action = Action.Walk): GLSprite | undefined {
		if (obj === undefined) return undefined;
		return this.getSpriteFromTexture(obj.texture, direction, action);
	}

	getSpritesFromObject(obj: XMLObject | undefined, direction = Direction.Front, action = Action.Walk): GLSprite[] {
		if (obj === undefined || obj.texture === undefined) return [];
		const texture = obj.texture.getTexture(0);
		let results: SpriteData | undefined;
		if (texture.animated) {
			results = this.manager.get<SpriteData>("sprites", {
				texture,
				direction,
				action,
				animated: true,
				multiple: true,
				giveTexture: true,
			})?.value;
		} else {
			const sprite = this.manager.get<SpriteData>("sprites", {
				texture,
				direction,
				action,
				giveTexture: true
			})?.value;
			results = sprite
		}
		
		const sprites = (results as SpriteData).sprite;

		if (sprites === undefined) {
			return [];
		}

		const glSprites: GLSprite[] = [];
		for (let sprite of (sprites as Sprite[])) {

			if (sprite === undefined) continue;
			const texture = results?.texture;
			if (texture === undefined) continue;
			const rect = this.fromSprite(sprite as Sprite);
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