export function progressPromise<T>(promises: Promise<T>[], onProgressChange?: (count: number) => void) {
	return new Promise((res, rej) => {
		const results: T[] = [];
		for (const promise of promises) {
			promise.then((result) => {
				results.push(result);
				if (onProgressChange !== undefined) onProgressChange(results.length);
				if (results.length === promises.length) {
					res(results);
				}
			})
		}
	})
}