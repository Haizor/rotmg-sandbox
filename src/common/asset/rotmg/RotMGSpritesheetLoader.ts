import AssetLoader from "../normal/AssetLoader";
import { SpritesheetManager } from "./atlas/Spritesheet";

export default class RotMGSpritesheetLoader implements AssetLoader<string, SpritesheetManager> {
	gl?: WebGLRenderingContext;
	constructor(gl?: WebGLRenderingContext) {
		this.gl = gl;
	}

	async load(sources: string[]): Promise<SpritesheetManager> {
		const manager = new SpritesheetManager(this.gl);
		for (const src of sources) {
			await manager.load(src);
		}
		return manager;
	}
}