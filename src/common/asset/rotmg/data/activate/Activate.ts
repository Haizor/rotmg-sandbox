import { SerializationData } from "common/asset/normal/Serializable";
import StatusEffectType from "../StatusEffectType";
import ActivateParser from "./ActivateParser";

export const ActivateData = (nodeName: string = "Activate") => {
	return {
		serialize: (activates: Activate[]) => {
			return {[nodeName]: activates.map((activate) => {
				if (activate === undefined) return undefined;
				const data: any = {
					"#text": activate.getName()
				}
		
				for (const [key, value] of Object.entries(activate)) {
					const metadata: SerializationData = Reflect.getMetadata("data", activate, key);
					if (metadata !== undefined) {
						data[metadata.name] = metadata.controller.serialize(value);
					}
				}
				return data;
			})}
		},
		deserialize: (xml: any) => {
	
			if (xml[nodeName] === undefined) return [];
			const activates = Array.isArray(xml[nodeName]) ? xml[nodeName] : [xml[nodeName]];
			return activates.map((xml: any) => ActivateParser.fromXML(xml, nodeName)).filter((activate: Activate) => activate !== undefined);
		}
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

export interface Proc {
	cooldown: number;
	proc: number;
	hpRequired?: number;
	hpMinThreshold?: number;
	requiredConditions: StatusEffectType;
	mustNotWear?: number;
	getName(): string
}