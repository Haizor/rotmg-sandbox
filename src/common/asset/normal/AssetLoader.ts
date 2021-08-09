export default interface AssetLoader<S, T> {
	load(sources: S[]): Promise<T>;
}