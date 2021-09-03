import AssetBundle from "./AssetBundle";
import { AssetContainer } from "./AssetContainer";
import AssetLoader from "./AssetLoader";
import JSZip from "jszip"
import SourceLoader from "./loaders/source/SourceLoader";
import Url2TextSourceLoader from "./loaders/source/Url2TextSourceLoader";
import File2TextSourceLoader from "./loaders/source/File2TextSourceLoader";

export default class AssetManager {
	private assetBundles: Map<string, AssetBundle> = new Map();
	private assetLoaders: Map<string, AssetLoader<any, AssetContainer<unknown>>> = new Map();
	private sourceLoaders: Map<string, SourceLoader<unknown, unknown>> = new Map();

	constructor() {
		this.registerSourceLoader("url-to-text", new Url2TextSourceLoader());
		this.registerSourceLoader("file-to-text", new File2TextSourceLoader());
	}

	addBundle(bundle: AssetBundle) {
		this.assetBundles.set(bundle.name, bundle);
	}

	registerLoader(name: string, loader: AssetLoader<any, any>) {
		this.assetLoaders.set(name, loader);
	}

	registerSourceLoader(name: string, loader: SourceLoader<unknown, unknown>) {
		this.sourceLoaders.set(name, loader);
	}

	async load(config: AssetManagerConfig) {
		const bundle = new AssetBundle(config.name);
		bundle.default = config.default ?? false;
		this.assetBundles.set(config.name, bundle)
		const promises: Map<string, Promise<void>> = new Map();
		for (const assetContainer of config.containers) {
			promises.set(assetContainer.type, this.loadContainer(bundle, assetContainer, promises));
		}
		await Promise.all(promises.values());
	}
	
	async loadContainer(bundle: AssetBundle, config: AssetContainerConfig<unknown>, promises: Map<string, Promise<void>>) {
		const { type, loader, settings, sources, depends } = config;
		const assetLoader = this.assetLoaders.get(config.loader);
		const sourceLoader = this.sourceLoaders.get(config.sourceLoader ?? "");
		if (assetLoader === undefined) return;

		if (depends !== undefined) {
			await Promise.all(depends.map((type) => promises.get(type)));
		}
		let srcs: any[] = sources;

		if (sourceLoader !== undefined) {
			srcs = await Promise.all(srcs.map((src) => sourceLoader.convert(src)));
		}

		const container = await assetLoader.load(srcs, settings);
		container.setMetadata({loader, type});

		bundle.containers.set(type, container);
	} 

	async loadZip(zip: JSZip) {
		const metadataFile = zip.file("metadata.json");
		if (metadataFile === null) return;
		const config = JSON.parse(await metadataFile.async("string"));
		config.containers.forEach((container: any) => {
			container.sources = container.sources.map((src: string) => zip.file(src));
		})
		await this.load(config);
	}

	get<T>(type: string, id: any): GetResult<T> | undefined {
		for (const bundle of this.assetBundles.values()) {
			const result = bundle.get<T>(type, id);
			if (result !== undefined) {
				return {
					...result,
					bundle
				};
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

	getContainers(type: string): AssetContainer<unknown>[] {
		const containers = [];
		for (const bundle of this.getBundles()) {
			const container = bundle.containers.get(type);
			if (container !== undefined) containers.push(container);
		}
		return containers;
	}
	
	deleteAssetBundle(bundle: AssetBundle): boolean {
		return this.assetBundles.delete(bundle.name);
	}
}

export type GetResult<T> = {
	value: T,
	container: AssetContainer<T>,
	bundle: AssetBundle
}

export interface AssetManagerConfig {
	name: string,
	containers: AssetContainerConfig<any>[];
	default?: boolean;
}

export interface AssetContainerConfig<T> {
	type: string,
	loader: string,
	settings?: any,
	sourceLoader?: string,
	depends?: string[],
	sources: T[]
}