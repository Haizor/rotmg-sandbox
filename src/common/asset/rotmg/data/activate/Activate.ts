import { SerializationData } from "common/asset/normal/Serializable";
import ActivateParser from "./ActivateParser";

export const ActivateData = {
	serialize: (activates: Activate[]) => {
		return activates.map((activate) => {
			if (activate === undefined) return undefined;
			const data: any = {
				"#text": activate.getName()
			}
	
			for (const [key, value] of Object.entries(activate)) {
				const metadata: SerializationData = Reflect.getMetadata("serialization", activate, key);
				if (metadata !== undefined) {
					data[metadata.name] = metadata.controller.serialize(value);
				} else 
				data[`@_${key}`] = value;
			}
			return data;
		})
	},
	deserialize: (xml: any) => {

		if (xml.Activate === undefined) return [];
		const activates = Array.isArray(xml.Activate) ? xml.Activate : [xml.Activate];
		return activates.map((xml: any) => ActivateParser.fromXML(xml)).filter((activate: Activate) => activate !== undefined);
	}
}

export function ActivateSerializer(value: Activate[]) {
	return value.map((activate: Activate) => {
		if (activate === undefined) return undefined;
		const data: any = {
			"#text": activate.getName()
		}

		for (const [key, value] of Object.entries(activate)) {
			const metadata: SerializationData = Reflect.getMetadata("serialization", activate, key);
			if (metadata !== undefined) {
				data[metadata.name] = metadata.controller.serialize(value);
			} else 
			data[`@_${key}`] = value;
		}
		return data;
	})
}

export default interface Activate {
	getName(): string
}