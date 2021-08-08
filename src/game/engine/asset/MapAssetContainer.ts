import { AssetContainer } from "./AssetContainer";

export default class MapAssetContainer<T> implements AssetContainer<T> {
	map: Map<string, T> = new Map();

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