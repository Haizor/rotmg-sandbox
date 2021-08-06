import AssetLoader from "../../engine/asset/AssetLoader";
import RotMGAssets from "./RotMGAssets";
import * as xmlParser from "fast-xml-parser";

export default class RotMGAssetLoader implements AssetLoader<string, RotMGAssets> {
	async load(sources: string[]): Promise<RotMGAssets> {
		const assets = new RotMGAssets();
		await assets.loadAtlases();
		const promises = [];
		for (const src of sources) {
			promises.push((new Promise<void>(async (res, rej) => {
				const txt = await (await fetch(src)).text();
				const xml = xmlParser.parse(txt, {
					parseAttributeValue: true,
					ignoreAttributes: false
				});
				for (const obj of xml.Objects.Object) {
					assets.parseFromXML(obj);
				}
				res();
			})))
		}
		await Promise.all(promises);
		return assets;
	}
}

