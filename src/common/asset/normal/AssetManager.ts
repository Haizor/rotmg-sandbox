import AssetBundle from "./AssetBundle";
import { AssetContainer } from "./AssetContainer";
import AssetLoader from "./AssetLoader";
import JSZip from "jszip"

export default class AssetManager {
	private assetBundles: Map<string, AssetBundle> = new Map();
	private assetLoaders: Map<string, AssetLoader<any, AssetContainer<any>>> = new Map();

	registerLoader(name: string, loader: AssetLoader<any, any>) {
		this.assetLoaders.set(name, loader);
	}

	async load(config: AssetManagerConfig) {
		const bundle = new AssetBundle(config.name);
		this.assetBundles.set(config.name, bundle)
		const promises: Map<string, Promise<void>> = new Map();
		for (const assetContainer of config.containers) {
			const { type, loader, sources, depends } = assetContainer;
			const assetLoader = this.assetLoaders.get(loader);
			if (assetLoader === undefined) {
				continue;
			}
			if (depends !== undefined) {
				promises.set(type, new Promise(async (res, rej) => {
					await Promise.all(depends.map((type) => promises.get(type)));
					const container = await assetLoader.load(sources);
					container.setMetadata({loader, type});
					bundle.containers.set(type, container);
					res();
				}))
			} else {
				promises.set(type, new Promise(async (res, rej) => {
					const container = await assetLoader.load(sources);
					container.setMetadata({loader, type});
					bundle.containers.set(type, container);
					res();
				}));
			}
		}
		await Promise.all(promises.values());
	}

	async loadZip(zip: JSZip) {
		zip.forEach((path, file) => console.log(path))
	}

	get<T>(type: string, id: any): GetResult<T> | undefined {
		for (const bundle of this.assetBundles.values()) {
			const result = bundle.get<T>(type, id);
			if (result !== undefined) {
				return result;
			}
		}
		return undefined;
	}

	getAll<T>(type: string): T[] {
		let assets: T[] = [];
		for (const bundle of this.assetBundles.values()) {
			for (const containerEntry of bundle.containers.entries()) {
				if (containerEntry[0] === type) {
					assets = [...assets, ...containerEntry[1].getAll()];
				}
			}
		}
		return assets;
	}

	getBundle(name: string): AssetBundle | undefined {
		return this.assetBundles.get(name);
	}

	getBundles(): AssetBundle[] {
		return Array.from(this.assetBundles.values())
	}
}

export type GetResult<T> = {
	value: T,
	container: AssetContainer<T>
}

export interface AssetManagerConfig {
	name: string,
	containers: AssetContainerConfig<any>[];
}

export interface AssetContainerConfig<T> {
	type: string,
	loader: string,
	depends?: string[];
	sources: T[]
}