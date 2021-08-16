import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { GLTextureInfo } from "common/asset/normal/loaders/TextureAssetLoader";
import { Texture } from "../data/Texture";

export enum Atlases {
	groundTiles = 1,
	characters = 2,
	mapObjects = 4
}

export interface Sprite {
	padding: number;
	index: number;
	spriteSheetName: string;
	atlasId: number;
	isTransparentSprite: boolean;
	position: SpritePosition;
	maskPosition: SpritePosition;	
}

export interface AnimatedSprite {
	index: number;
	spriteSheetName: string;
	direction: number;
	action: number;
	spriteData: Sprite;
}

export interface SpritePosition {
	x: number;
	y: number;
	w: number;
	h: number;
}

//This is the direction the sprite is facing
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

interface SpriteGetOptions {
	texture: Texture;
	direction?: Direction;
	action?: Action;
	multiple?: boolean;
	giveTexture?: boolean;
}

export type Sprites = Sprite | Sprite[]

export type SpriteData = {
	sprite: (Sprite | Sprite[]) | undefined;
	texture?: GLTextureInfo
}

export type SpriteResult = Sprites | SpriteData;

export class SpritesheetManager implements AssetContainer<SpriteResult> {
	metadata: Metadata | undefined;
	gl: WebGLRenderingContext | undefined;
	textures: Map<number, GLTextureInfo> = new Map();
	
	constructor(gl?: WebGLRenderingContext) {
		if (gl) {
			this.initGL(gl);
		}
	}

	initGL(gl: WebGLRenderingContext) {
		this.gl = gl;
		for (const atlas in Atlases) {
			const id = parseInt(atlas);
			if (!isNaN(id)) {
				const texture = gl.createTexture();
				if (texture === null) continue;
				gl.bindTexture(gl.TEXTURE_2D, texture);
				const name = Atlases[atlas];
				const url = `https://www.haizor.net/rotmg/assets/production/atlases/${name}.png`;
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
				const img = new Image();
				img.crossOrigin = "";
				img.src = url;
				img.onload = () => {
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  gl.RGBA, gl.UNSIGNED_BYTE, img);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
					const textureInfo = this.textures.get(id);
					if (textureInfo !== undefined) textureInfo.size = {
						width: img.naturalWidth,
						height: img.naturalHeight
					}
				}
				this.textures.set(id, {
					texture,
					size: {
						width: img.naturalWidth,
						height: img.naturalHeight
					}
				});
			}
		}
	}

	get(id: SpriteGetOptions): SpriteResult | undefined {
		let sprite;
		if (id.texture.animated) {
			if (id.multiple) {
				sprite = this.getAnimatedSpritesFromTexture(id.texture, id.direction || Direction.Side, id.action || Action.Walk);

			} else {
				sprite = this.getAnimatedSpriteFromTexture(id.texture, id.direction || Direction.Side, id.action || Action.Walk);
			}
		} else {
			sprite = this.getSpriteFromTexture(id.texture);
		}

		if (sprite === undefined) return undefined;
		if (id.giveTexture === true) {
			return {
				sprite,
				texture: this.getGLTextureFromSprite(sprite)
			}
		}
		return sprite;
	}

	getAll(): (SpriteResult)[] {
		return this._sprites.map((sprite) => { return {sprite} });
	}

	getMetadata(): Metadata | undefined {
		return this.metadata;
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}

	private _sprites: Sprite[] = [];
	private _animatedSprites: AnimatedSprite[] = [];

	private _atlases: HTMLImageElement[] = [];

	async load(src: string) {
		const json = JSON.parse(src);
		this._sprites = json.sprites;
		this._animatedSprites = json.animatedSprites;

		for (const atlasId in Atlases) {
			const atlas = atlasSources[atlasId]
			if (atlas === undefined) continue;

			const img = new Image();
			img.src = atlas.src;
			await new Promise<void>((res, rej) => {
				img.onload = () => res();
			})
			this._atlases[atlasId] = img;
		}
	}

	getSpriteFromTexture(texture: Texture) {
		return this._sprites.find((s) => s.index === texture.index && s.spriteSheetName === texture.file);
	}

	getAnimatedSpritesFromTexture(texture: Texture, direction: Direction, action: Action): Sprite[] {
		return this._animatedSprites.filter((s) => s.index === texture.index && s.spriteSheetName === texture.file && s.direction === direction && s.action === action).map((sprite) => sprite.spriteData);
	}

	getAnimatedSpriteFromTexture(texture: Texture, direction: Direction, action: Action) {
		return this._animatedSprites.find((s) => s.index === texture.index && s.spriteSheetName === texture.file && s.direction === direction && s.action === action)?.spriteData;
	}

	atlasNameFromId(id: number) {
		switch(id) {
			case 1:
				return "groundTiles";
			case 2:
				return "characters";
			case 4:
				return "mapObjects"
		}
		return "";
	}

	getGLTextureFromSprite(sprite: (Sprite | Sprite[]) | undefined): GLTextureInfo | undefined {
		if (sprite === undefined) return;
		if (Array.isArray(sprite)) {
			return this.textures.get(sprite[0].atlasId)
		}
		return this.textures.get(sprite.atlasId);
	}

	imageFromTexture(texture: Texture) {
		const sprite = this.getSpriteFromTexture(texture);
		if (sprite === undefined) {
			return undefined;
		}
		const img = document.createElement("div");

		const xSize = 64;
		const ySize = 64;

		const xRatio = xSize / sprite.position.w;
		const yRatio = ySize / sprite.position.h;

		img.style.width = `${xSize}px`;
		img.style.height = `${ySize}px`;
		img.style.backgroundImage = `url(${(Atlases as any)[sprite.atlasId].src})`
		img.style.backgroundPositionX = `-${sprite.position.x * xRatio}px`
		img.style.backgroundPositionY = `-${sprite.position.y * yRatio}px`
		
		img.style.backgroundSize = `${this._atlases[sprite.atlasId].naturalWidth * xRatio}px ${this._atlases[sprite.atlasId].naturalHeight * yRatio}px`
		img.style.imageRendering = "crisp-edges"


		return img;
	}
} 

//god i fucking hate ts
const atlasSources = [
	undefined,
	{
		src: "https://www.haizor.net/rotmg/assets/production/atlases/groundTiles.png"
	},
	{
		src: "https://www.haizor.net/rotmg/assets/production/atlases/characters.png"
	},
	undefined,
	{
		src: "https://www.haizor.net/rotmg/assets/production/atlases/mapObjects.png"
	}
]