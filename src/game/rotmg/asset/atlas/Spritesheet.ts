import Texture from "../../data/Texture";

export enum Atlases {
	groundTiles = 1,
	characters = 2,
	mapObjects = 4
}

export class SpritesheetManager {
	private _sprites: Sprite[] = [];
	private _animatedSprites: AnimatedSprite[] = [];

	private _atlases: HTMLImageElement[] = [];

	async load() {
		const json = await (await fetch("https://www.haizor.net/rotmg/assets/production/atlases/spritesheet.json")).json();
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