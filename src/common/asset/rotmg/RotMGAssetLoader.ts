import RotMGAssets from "./RotMGAssets";
import * as xmlParser from "fast-xml-parser";
import AssetLoader from "../normal/AssetLoader";

export default class RotMGAssetLoader implements AssetLoader<string, RotMGAssets> {
	async load(sources: string[]): Promise<RotMGAssets> {
		const assets = new RotMGAssets();
		const promises = [];
		for (const src of sources) {
			promises.push((new Promise<void>(async (res, rej) => {
				if (/\.xml/.test(src)) {
					const txt = await (await fetch(src)).text();
					const xml = xmlParser.parse(txt, {
						parseAttributeValue: true,
						ignoreAttributes: false
					});
					for (const obj of xml.Objects.Object) {
						assets.parseFromXML(obj);
					}
					res();
				}
			})))
		}
		await Promise.all(promises);
		return assets;
	}
}

