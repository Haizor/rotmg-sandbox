import RotMGAssets from "./RotMGAssets";
import * as xmlParser from "fast-xml-parser";
import AssetLoader from "../normal/AssetLoader";

export default class RotMGAssetLoader implements AssetLoader<string, RotMGAssets> {


	async load(sources: string[], settings: any = {readOnly: false}): Promise<RotMGAssets> {
		const assets = new RotMGAssets(settings.readOnly);
		const promises = [];
		for (const src of sources) {
			promises.push((new Promise<void>(async (res, rej) => {
				const xml = xmlParser.parse(src, {
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

