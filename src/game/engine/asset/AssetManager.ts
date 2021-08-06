import AssetLoader from "./AssetLoader";

export default class AssetManager {
	private assetContainers: Map<string, any> = new Map();
	private assetLoaders: Map<string, AssetLoader<any, any>> = new Map();
	private config: AssetManagerConfig<any>[] = [];

	constructor(config: AssetManagerConfig<any>[]) {
		this.config = config;
	}

	registerLoader(name: string, loader: AssetLoader<any, any>) {
		this.assetLoaders.set(name, loader);
	}

	async load() {
		const promises: Map<string, Promise<void>> = new Map();
		for (const assetContainer of this.config) {
			const { name, loader, sources, depends } = assetContainer;
			const assetLoader = this.assetLoaders.get(loader);
			if (assetLoader === undefined) {
				continue;
			}
			if (depends !== undefined) {
				promises.set(name, new Promise(async (res, rej) => {
					await Promise.all(depends.map((name) => promises.get(name)));
					this.assetContainers.set(name, await assetLoader.load(sources));
					res();
				}))
			} else {
				promises.set(name, new Promise(async (res, rej) => {
					this.assetContainers.set(name, await assetLoader.load(sources));
					res();
				}));
			}
		}
		await Promise.all(promises.values());
	}

	get<T>(name: string): T {
		return this.assetContainers.get(name) as T;
	}
}

export interface AssetManagerConfig<T> {
	name: string,
	loader: string,
	depends?: string[];
	sources: T[]
}