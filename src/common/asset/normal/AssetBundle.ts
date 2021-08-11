import { AssetContainer } from "./AssetContainer";
import JSZip from "jszip"
import Serializable from "./Serializable";

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

	exportToZip() {
		const zip = new JSZip();
		for (const container of this.containers.entries()) {
			const name = container[0];
			const metadata = container[1].getMetadata();
			if (metadata === undefined) continue;
			zip.file(`containers/${name}/metadata.json`, JSON.stringify(metadata))
			try {
				const values = container[1].getAll();
				const serialized = []
				if ("serialize" in values[0]) {
					for (const value of values) {
						serialized.push(value.serialize())
					}
				}
				zip.file(`containers/${name}/data.json`, JSON.stringify({
					name,
					data: serialized
				}))
			} catch (error) {
				console.log()
				continue;
			}
		}
		return zip;
	}
}

type GetResult<T> = {
	value: T,
	container: AssetContainer<T>
}