import AssetLoader from "../normal/AssetLoader";
import NewSpritesheet from "./atlas/NewSpritesheet";

export default class RotMGSpritesheetLoader implements AssetLoader<string, NewSpritesheet> {
	gl?: WebGLRenderingContext;
	constructor(gl?: WebGLRenderingContext) {
		this.gl = gl;
	}

	async load(sources: string[]): Promise<NewSpritesheet> {
		const manager = new NewSpritesheet();
		for (const src of sources) {
			await manager.load(src);
		}
		return manager;
	}
}