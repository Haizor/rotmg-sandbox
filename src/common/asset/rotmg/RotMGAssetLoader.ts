import RotMGAssets from "./RotMGAssets";
import * as xmlParser from "fast-xml-parser";
import AssetLoader from "../normal/AssetLoader";

export default class RotMGAssetLoader implements AssetLoader<string, RotMGAssets> {


	async load(sources: string[], settings: any = {readOnly: false}): Promise<RotMGAssets> {
		const assets = new RotMGAssets(settings.readOnly);
		await Promise.all(sources.map(async (src) => {
			const xml = xmlParser.parse(src, {
				parseAttributeValue: true,
				ignoreAttributes: false
			});
			if (Array.isArray(xml.Objects.Object)) {
				for (const obj of xml.Objects.Object) {
					assets.parseFromXML(obj);
				}
			} else {
				assets.parseFromXML(xml.Objects.Object);
			}
		}))

		return assets;
	}
}

