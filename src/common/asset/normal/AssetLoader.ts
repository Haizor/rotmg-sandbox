export default interface AssetLoader<S, T> {
	load(sources: S[], settings?: any): Promise<T>;
}