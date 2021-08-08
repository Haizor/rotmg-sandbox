import { TextureMap } from "../engine/asset/TextureAssetLoader";
import Rect from "../engine/logic/Rect";
import Vec2 from "../engine/logic/Vec2";
import { GLSprite } from "../engine/obj/GameObject";
import { Action, Direction, Sprite } from "./asset/atlas/Spritesheet";
import RotMGAssets from "./asset/RotMGAssets";
import { TextureProvider, Texture, AnimatedTexture } from "./data/Texture";
import XMLObject from "./data/XMLObject";

export default class RenderHelper {
	assets: RotMGAssets;
	textures: TextureMap;
	
	constructor(assets: RotMGAssets, textures: TextureMap) {
		this.assets = assets;
		this.textures = textures;
	}

	getSpriteFromTexture(texture: TextureProvider | undefined, direction = Direction.Front, action = Action.Walk, time: number = 0): GLSprite | undefined {
		if (texture === undefined) return undefined;
		let sprite: Sprite | undefined;
		const textureData = texture.getTexture(time);
		if (textureData.animated) {
			sprite = this.assets.spritesheetManager.getAnimatedSpriteFromTexture(textureData, direction, action);
		} else {
			sprite = this.assets.spritesheetManager.getSpriteFromTexture(textureData);
		}

		if (sprite === undefined) return undefined;
		const textureWebGL = this.textures.get(this.assets.spritesheetManager.atlasNameFromId(sprite.atlasId));
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
		let sprites: (Sprite | undefined)[];
		if (texture.animated) {
			sprites = this.assets.spritesheetManager.getAnimatedSpritesFromTexture(texture, direction, action);
		} else {
			sprites = [this.assets.spritesheetManager.getSpriteFromTexture(texture)]
		}

		const glSprites: GLSprite[] = [];
		for (let sprite of sprites) {
			if (sprite === undefined) continue;
			const texture = this.textures.get(this.assets.spritesheetManager.atlasNameFromId(sprite.atlasId));
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