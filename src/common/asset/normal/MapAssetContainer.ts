import { AssetContainer, Metadata } from "./AssetContainer";

export default class MapAssetContainer<T> implements AssetContainer<T> {
	map: Map<string, T> = new Map();
	metadata: Metadata | undefined;

	constructor(map: Map<string, T>) {
		this.map = map;
	}

	getMetadata(): Metadata | undefined {
		return this.metadata
	}
	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}

	set(id: string, obj: T): void {
		this.map.set(id, obj);
	}

	get(id: string): T | undefined {
		return this.map.get(id);
	}

	getAll() {
		return Array.from(this.map.values());
	}
} 