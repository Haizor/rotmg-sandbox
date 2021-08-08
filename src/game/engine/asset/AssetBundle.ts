import { AssetContainer } from "./AssetContainer";

export default class AssetBundle {
	name: string;
	containers: Map<string, AssetContainer<any>> = new Map();
	constructor(name: string) {
		this.name = name;
	}

	get<T>(type: string, id: any): GetResult<T> | undefined {
		for (const container of this.containers.entries()) {
			if (container[0] !== type) continue;
			const obj = container[1].get(id);
			if (obj !== undefined) {
				return {
					value: obj,
					container: container[1]
				};
			}
		}
	}
}

type GetResult<T> = {
	value: T,
	container: AssetContainer<T>
}