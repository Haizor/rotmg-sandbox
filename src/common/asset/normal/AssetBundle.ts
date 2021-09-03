import { AssetContainer } from "./AssetContainer";
import JSZip from "jszip"

export default class AssetBundle {
	name: string;
	containers: Map<string, AssetContainer<any>> = new Map();
	dirty: boolean = false;
	default: boolean = false;
	
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
		const mainMetadata: any = {
			name: this.name,
			containers: []
		};
		for (const container of this.containers.entries()) {
			const name = container[0];
			const metadata = container[1].getMetadata();
			if (metadata === undefined) continue;
			try {
				let serialized = []
				if ("serialize" in container[1]) {
					serialized = (container[1] as any).serialize();
				}

				const path = `containers/${name}/data.asset`
				zip.file(path, serialized)
				mainMetadata.containers.push({
					type: metadata.type,
					loader: metadata.loader,
					sourceLoader: "file-to-text",
					sources: [ path ] 
				})
			} catch (error) {
				console.log(error)
				continue;
			}
		}
		zip.file("metadata.json", JSON.stringify(mainMetadata));
		return zip;
	}
}

type GetResult<T> = {
	value: T,
	container: AssetContainer<T>
}