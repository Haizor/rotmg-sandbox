export default interface SourceLoader<T, S> {
	convert(src: T) : Promise<S>;
}