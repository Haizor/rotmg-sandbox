import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { GLTextureInfo } from "common/asset/normal/loaders/TextureAssetLoader";
import { BasicTexture, Texture } from "../data/Texture";

export type SpritePosition = {
	x: number;
	y: number;
	w: number;
	h: number;
}

export type SpriteColor = {
	r: number;
	g: number;
	b: number;
	a: number;
}

export type SpriteAtlasData = {
	spriteSheetName: string;
	atlasId: number;
	elements: SpriteData[];
}

export type SpriteData = {
	padding: number;
	index: number;
	spriteSheetName: string;
	aId: number;
	isTransparentSprite: boolean;
	position: SpritePosition;
	maskPosition: SpritePosition;	
	mostCommonColor: SpriteColor;
}

export type AnimatedSpriteData = {
	index: number;
	spriteSheetName: string;
	direction: number;
	action: number;
	spriteData: SpriteData;
}

export enum Direction {
	Side,
	Unknown,
	Front,
	Back
}

export enum Action {
	None, 
	Walk,
	Attack,
}

export class Sprite {
	private _data: SpriteData;
	private _texture?: GLTextureInfo

	constructor(data: SpriteData, texture?: GLTextureInfo) {
		this._data = data;
		this._texture = texture;
	}

	getData() {
		return this._data;
	}

	getAtlasSource(): string | undefined{
		switch(this._data.aId) {
			case 1:
				return "https://www.haizor.net/rotmg/assets/production/atlases/groundTiles.png"
			case 2:
				return "https://www.haizor.net/rotmg/assets/production/atlases/characters.png"
			case 4: 
				return "https://www.haizor.net/rotmg/assets/production/atlases/mapObjects.png"
		}
	}

	getGLTexture(): GLTextureInfo | undefined {
		return this._texture;
	}

	setGLTexture(texture?: GLTextureInfo) {
		this._texture = texture;
	}

	asTexture() {
		return new BasicTexture(this._data.spriteSheetName, this._data.index, false);
	}
}

export type SpriteGetOptions = {
	animated?: boolean;
	multiple?: boolean;

	direction?: number;
	action?: number;

	texture?: Texture
	index: number;
	spriteSheetName: string;
}

export default class NewSpritesheet implements AssetContainer<Sprite | Sprite[]> {
	private _sprites: SpriteAtlasData[] = [];
	private _animatedSprites: AnimatedSpriteData[] = [];
	private _textures: Map<number, GLTextureInfo> = new Map();

	gl?: WebGLRenderingContext;
	metadata?: Metadata;

	constructor(gl?: WebGLRenderingContext) {
		this.gl = gl;
	}

	async load(src: string) {
		try {
			const json = JSON.parse(src);
			this._sprites = json.sprites;
			this._animatedSprites = json.animatedSprites;
		} catch (e) {
			console.log("Failed to load sprite JSON!");
		}
	}

	get(options: SpriteGetOptions): (Sprite | Sprite[]) | undefined {
		const { multiple } = options;
		let animated: boolean;
		let index: number;
		let spriteSheetName : string;

		if (options.texture !== undefined) {
			index = options.texture.index;
			spriteSheetName = options.texture.file;
			animated = options.texture.animated;
		} else {
			index = options.index;
			spriteSheetName = options.spriteSheetName;
			animated = options.animated ?? false;
		}

		if (animated === true) {
			const direction = options.direction ?? Direction.Side;
			const action = options.action ?? Action.Walk;

			if (multiple === true) {
				const data = this._animatedSprites.filter((data) => data.index === index && data.spriteSheetName === spriteSheetName && data.action === action && data.direction === direction);
				if (data.length === 0) return [];

				return data.map((data) => {
					const sprite = new Sprite(data.spriteData);
					sprite.setGLTexture(this.getWebGLTextureFromSprite(sprite));
					return sprite;
				})
			} else {
				const data = this._animatedSprites.find((data) => data.index === index && data.spriteSheetName === spriteSheetName && data.action === action && data.direction === direction);
				if (data === undefined) return;
	
				const sprite = new Sprite(data.spriteData);
				sprite.setGLTexture(this.getWebGLTextureFromSprite(sprite));
	
				return sprite;
			}
		} else {
			const atlas = this._sprites.find((data) => data.spriteSheetName === spriteSheetName);
			const data = atlas?.elements.find((data) => data.index === index);
			if (data === undefined) return;

			const sprite = new Sprite(data);
			sprite.setGLTexture(this.getWebGLTextureFromSprite(sprite));

			return sprite;
		}
	}

	getWebGLTextureFromSprite(sprite: Sprite): GLTextureInfo | undefined {
		const data = sprite.getData();
		if (this._textures.has(data.aId)) {
			const texture = this._textures.get(data.aId);
			if (this.gl?.isTexture(texture?.texture as WebGLTexture)) {
				return this._textures.get(data.aId);
			}
		}

		if (this.gl === undefined) return undefined;
		const gl = this.gl;
		const atlasURL = sprite.getAtlasSource();
		if (atlasURL === undefined) return;
		const texture = gl.createTexture();
		if (texture === null) return;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

		const img = new Image();
		img.crossOrigin = "";
		img.src = atlasURL;
		img.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			const info = this._textures.get(data.aId) as GLTextureInfo;
			info.size = {width: img.naturalWidth, height: img.naturalHeight}
		}

		const textureInfo = {
			texture,
			size: {width: 1, height: 1}
		}

		this._textures.set(data.aId, textureInfo);

		return textureInfo;
	}
	
	getAll(): Sprite[] {
		throw new Error("Method not implemented.");
	}

	getMetadata(): Metadata | undefined {
		return this.metadata;
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}
}