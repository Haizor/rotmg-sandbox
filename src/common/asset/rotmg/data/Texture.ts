export interface TextureProvider {
	getTexture(time: number): Texture;
	serialize(): any;
}

export interface Texture {
	file: string,
	index: number,
	animated: boolean
}

export function TextureSerializer(texture?: TextureProvider): any {
	if (texture === undefined) return;

	return texture.serialize();
}

function serializeTextureObject(texture: Texture) {
	return {
		File: texture.file,
		Index: texture.index
	}
}

export class BasicTexture implements TextureProvider, Texture {
	file: string = ""
	index: number = 0
	animated: boolean = false;

	constructor(file: string, index: number, animated: boolean) {
		this.file = file;
		this.index = index;
		this.animated = animated;
	}

	getTexture(): Texture {
		return this;
	}

	serialize() {
		const key = this.animated ? "AnimatedTexture" : "Texture";
		return {[key]: serializeTextureObject(this)}
	}

	static fromXML(xml: any): TextureProvider {
		if (xml.RandomTexture !== undefined) {
			if (xml.RandomTexture.Texture instanceof Array) {
				return new RandomTexture(xml.RandomTexture.Texture.map((tex: any): Texture => {
					return {
						animated: false,
						file: tex.File,
						index: tex.Index
					}
				}));
			} else {

				return new RandomTexture([xml.RandomTexture.Texture])
			}

		} else if (xml.Animation !== undefined) {
			return new AnimatedTexture(0, xml.Animation.Frame.map((frame: any) => {
				return {time: frame["@_time"], texture: {
					file: frame.Texture.File,
					index: frame.Texture.Index,
					animated: false
				}}
			}))
		}
		const texture = xml.Texture || xml.AnimatedTexture;
		return new BasicTexture(texture.File, texture.Index, xml.AnimatedTexture !== undefined);
	}
}

export class RandomTexture implements TextureProvider {
	textures: Texture[] = [];
	constructor(textures: Texture[]) {
		this.textures = textures;
	}

	getTexture() {
		return this.textures[Math.floor(Math.random() * this.textures.length)];
	}

	serialize() {
		let obj: any = {
			RandomTexture: {
				AnimatedTexture: [],
				Texture: []
			}
		}
		for (const tex of this.textures) {
			(tex.animated ? obj.RandomTexture.AnimatedTexture : obj.RandomTexture.Texture).push(serializeTextureObject(tex));
		}
		return obj;
	}
}

export class AnimatedTexture implements TextureProvider {
	frames: Frame[];
	maxTime: number = 0;
	constructor(probabilty: number, frames: Frame[]) {
		this.frames = frames;
		for (const frame of this.frames) {
			this.maxTime += frame.time;
		}
	}

	getTexture(time: number): Texture {
		let timeSeconds = (time / 1000) % this.maxTime;
		for (const frame of this.frames) {
			timeSeconds -= frame.time;
			if (timeSeconds < 0) {
				return frame.texture;
			}
		}
		return this.frames[0].texture;
	}

	serialize() {
		return {
			Animation: {
				Frame: this.frames.map((frame) => {
					return {
						"@_time": frame.time,
						Texture: serializeTextureObject(frame.texture)
					}
				})
			}
		}
	}
}

type Frame = {
	time: number,
	texture: Texture
}