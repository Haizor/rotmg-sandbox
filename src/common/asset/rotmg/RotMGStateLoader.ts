import AssetLoader from "../normal/AssetLoader";
import RotMGStates from "./RotMGStates";
import * as xmlParser from "fast-xml-parser";

export default class RotMGStateLoader implements AssetLoader<string, RotMGStates> {
	async load(sources: string[]): Promise<RotMGStates> {
		const behaviours = new RotMGStates();
		sources.forEach((src) => {
			const xml = xmlParser.parse(src, {
				parseAttributeValue: true,
				ignoreAttributes: false
			});

			if (Array.isArray(xml.States.State)) {
				for (const state of xml.States.State) {
					behaviours.parseFromXML(state);
				}
			} else {
				behaviours.parseFromXML(xml.States.State)
			}
		})
		return behaviours;
	}
}