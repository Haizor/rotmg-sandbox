export type Metadata = {
	type: string,
	loader: string
}

export interface AssetContainer<T> {
	get(id: any): T | undefined;
	getAll(): T[];

	getMetadata(): Metadata | undefined;
	setMetadata(metadata: Metadata): void;
}