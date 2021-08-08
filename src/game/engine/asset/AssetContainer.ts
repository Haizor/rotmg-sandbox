export interface AssetContainer<T> {
	get(id: any): T | undefined;
	getAll(): T[];
}