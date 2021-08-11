import AssetLoader from "../AssetLoader";

export default class RawAssetLoader implements AssetLoader<string, string[]> {
	async load(sources: string[]): Promise<string[]> {
		return await Promise.all(sources.map(async (src) => (await fetch(src)).text()));
	}
}