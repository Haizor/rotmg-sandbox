import { Action, Direction, AssetManager, TextureProvider, Sprite, CustomSpritesheet, XMLObject, SpriteData, Atlases, Texture } from "@haizor/rotmg-utils";
import Rect from "../engine/logic/Rect";
import Vec2 from "../engine/logic/Vec2";

export type RenderOptions = {
	time?: number;
	action?: Action;
	direction?: Direction;
}

export class RenderHelper {
	gl: WebGLRenderingContext;
	manager: AssetManager;

	private _textures: {
		[key: number]: WebGLTexture;
	}  = {}

	constructor(gl: WebGLRenderingContext, manager: AssetManager) {
		this.gl = gl;
		this.manager = manager;
	}

	getSpritesFromObject(xml?: XMLObject): Sprite[] {
		if (xml === undefined || xml.texture === undefined) return [];
		const texture = xml.texture;
		return this.getSpritesFromTexture(texture);
	}

	getSpriteFromTexture(texture?: TextureProvider): Sprite | undefined {
		if (texture === undefined) return;
		const sprites = this.manager.get<Sprite | Sprite[]>("sprites", {
			texture: texture.getTexture(0),
			all: true
		})?.value;
		if (sprites instanceof Sprite) return sprites;
		if (sprites === undefined || sprites.length === 0) return;
		return sprites[0];
	}

	getSpritesFromTexture(texture?: TextureProvider): Sprite[] {
		if (texture === undefined) return [];
		const sprites = this.manager.get<Sprite | Sprite[]>("sprites", {
			texture: texture.getTexture(0),
			all: true
		})?.value;
		if (sprites instanceof Sprite) return [ sprites ]; 
		if (sprites === undefined) return [];
		return sprites;
	}

	getTexture(sprite: Sprite): WebGLTexture {
		const gl = this.gl;
		const id = sprite.getData().aId;

		if (this._textures[id] !== undefined) return this._textures[id];
		const texture = gl.createTexture();
		if (texture === null) throw new Error("Failed to create texture!");
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = Atlases[id];
		image.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}

		this._textures[id] = texture;
		return texture;
	}
}