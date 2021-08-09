import AssetLoader from "./AssetLoader";

export default class TextureAssetLoader implements AssetLoader<TextureConfig, TextureMap> {
	gl: WebGLRenderingContext;
	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	async load(sources: TextureConfig[]): Promise<TextureMap> {
		const { gl } = this;
		const textureMap: TextureMap = new Map();
		for (const src of sources) {
			const img = await this.loadImage(src.src);
			const texture = gl.createTexture();

			if (texture === null) {
				console.error(`Failed to create texture with name '${src.name}'`);
				continue;
			}

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

			textureMap.set(src.name, {
				texture,
				size: {
					width: img.naturalWidth,
					height: img.naturalHeight
				}
			});
		}
		return textureMap;
	}

	async loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((res, rej) => {
			const img = new Image();
			img.crossOrigin = "";
			img.src = src;
			img.onload = () => res(img);
		})
	}
}

export type GLTextureInfo = {
	texture: WebGLTexture;
	size: {width: number, height: number}
}

export type TextureMap = Map<string, GLTextureInfo>;
export type TextureConfig = {
	name: string,
	src: string
}