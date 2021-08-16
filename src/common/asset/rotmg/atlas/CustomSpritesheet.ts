import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { Sprite } from "./Spritesheet";

export default class CustomSpritesheet implements AssetContainer<Sprite> {
	name: string;
	metadata: Metadata | undefined;
	ctx: CanvasRenderingContext2D;
	sprites: Sprite[] = [];
	width: number = 512;
	height: number = 512;

	constructor(name: string) {
		this.name = name;
		const canvas = document.createElement("canvas");
		canvas.style.display = "none";
		canvas.width = this.width;
		canvas.height = this.height;

		const ctx = canvas.getContext("2d");
		if (ctx === null) {
			throw new Error("Failed to create canvas context for custom sprites!")
		}
		this.ctx = ctx;
	}

	add(image: HTMLImageElement) {
		return this.set(this.sprites.length, image);
	}

	set(index: number, image: HTMLImageElement) {
		const { ctx } = this;
		const x = ((this.width / 8) % index) * 8
		const y = Math.floor(index / (this.height / 8) * 8)
		ctx.drawImage(image, x, y, 8, 8);

		this.sprites[index] = {
			padding: 0,
			atlasId: -1,
			index,
			spriteSheetName: this.name,
			isTransparentSprite: true,
			position: {
				x,
				y,
				w: 8,
				h: 8
			},
			maskPosition: {
				x: 0,
				y: 0,
				w: 0, 
				h: 0
			}
		}
	}

	get(id: any): Sprite | undefined {
		throw new Error("Method not implemented.");
	}

	getAll(): Sprite[] {
		throw new Error("Method not implemented.");
	}

	getMetadata(): Metadata | undefined {
		return this.metadata
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}
}