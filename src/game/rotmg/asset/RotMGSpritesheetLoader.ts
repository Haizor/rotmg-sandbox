import AssetLoader from "../../engine/asset/AssetLoader";
import { SpritesheetManager } from "./atlas/Spritesheet";

export default class RotMGSpritesheetLoader implements AssetLoader<string, SpritesheetManager> {
	async load(sources: string[]): Promise<SpritesheetManager> {
		const manager = new SpritesheetManager();
		for (const src of sources) {
			await manager.load(src);
		}
		return manager;
	}
}