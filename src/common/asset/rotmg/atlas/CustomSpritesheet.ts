import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { Sprite, SpriteData, SpriteGetOptions } from "./NewSpritesheet";

export class CustomSprite extends Sprite {
	blob: string;

	constructor(data: SpriteData, blob: string) {
		super(data);
		this.blob = blob;
	}

	getAtlasSource() {
		return this.blob;
	}
	
	serialize() {
		return this.getData();
	}
}

export default class CustomSpritesheet implements AssetContainer<Sprite> {
	name?: string;
	metadata?: Metadata;
	ctx: CanvasRenderingContext2D;
	sprites: CustomSprite[] = [];
	width: number = 512;
	height: number = 512;
	blob?: string;

	texture?: WebGLTexture;
	gl?: WebGLRenderingContext;

	constructor(name?: string) {
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

	async add(image: HTMLImageElement) {
		return this.set(this.sprites.length, image);
	}

	initGL(gl: WebGLRenderingContext) {
		this.gl = gl;
		const texture = gl.createTexture();
		if (texture === null) return;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		this.texture = texture;
	}

	async set(index: number, image: HTMLImageElement): Promise<Sprite | undefined> {
		const { ctx } = this;
		const x = (index % (this.width / 8)) * 8
		const y = Math.floor(index / (this.height / 8) * 8)
		return new Promise((res, rej) => {
			image.addEventListener("load", async () => {
				ctx.drawImage(image, x, y, 8, 8);
				await this.updateBlob();	
				this.updateTexture();	
		
				const data = {
					padding: 0,
					atlasId: -1,
					index,
					spriteSheetName: this.name ?? "unknown",
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

				this.sprites[index] = new CustomSprite(data, this.blob as string);
				res(this.sprites[index]);
			})
		})
	}



	async updateBlob() {
		this.ctx.canvas.toBlob((blob) => {
			const url = URL.createObjectURL(blob);
			if (this.blob !== undefined) {
				URL.revokeObjectURL(this.blob);
			}
			this.blob = url;

			for (const sprite of this.sprites) {
				sprite.blob = url;
			}
		})
	}

	updateTexture() {
		const gl = this.gl; 
		if (gl === undefined || this.texture === undefined) return;
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.ctx.canvas);
		for (const sprite of this.sprites) {
			sprite.setGLTexture({
				texture: this.texture,
				size: {width: this.width, height: this.height}
			});
		}
	}

	get(id: SpriteGetOptions): Sprite | undefined {
		let index: number;
		let spriteSheetName: string;
		if (id.texture) {
			index = id.texture.index;
			spriteSheetName = id.texture.file;
		} else {
			index = id.index;
			spriteSheetName = id.spriteSheetName;
		}

		return this.sprites.find((sprite) => {
			const data = sprite.getData();
			return data.index === index && data.spriteSheetName === spriteSheetName;
		})
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

	async load(src: any) {
		const data = JSON.parse(src);
		return new Promise<void>((res, rej) => {
			this.name = data.name;
			const img = new Image();

			img.src = data.image;
			img.addEventListener("load", async () => {

				this.ctx.drawImage(img, 0, 0);
				await this.updateBlob();
				this.sprites = data.sprites.map((sprite: any) => new CustomSprite(sprite, this.blob as string))
				res();
			})
		})
	}

	serialize() {
		return JSON.stringify({
			name: this.name,
			image: this.ctx.canvas.toDataURL(),
			sprites: this.sprites.map((sprite) => sprite.serialize())
		})
	}
}