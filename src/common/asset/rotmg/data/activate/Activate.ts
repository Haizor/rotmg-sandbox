import { SerializationData } from "common/asset/normal/Serializable";

export function ActivateSerializer(value: Activate[]) {
	return value.map((activate: Activate) => {
		if (activate === undefined) return undefined;
		const data: any = {
			"#text": activate.getName()
		}

		for (const [key, value] of Object.entries(activate)) {
			const metadata: SerializationData = Reflect.getMetadata("serialization", activate, key);
			if (metadata !== undefined) {
				data[metadata.name] = metadata.serializer(value);
			} else 
			data[`@_${key}`] = value;
		}
		return data;
	})
}

export default interface Activate {
	getName(): string
}