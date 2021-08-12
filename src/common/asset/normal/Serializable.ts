import "reflect-metadata"

export default interface Serializable {
	serialize(): string;
}

export function XMLValue (input: any) {
	return input;
}

export function XMLBoolean(input: boolean) {
	return input !== false ? {"#text": ""} : undefined;
}

export function XMLNoDefault<T>(defaultValue: T) {
	return function(input: T) {
		if (input === defaultValue) return;
		return input;
	}
}

export type Serializer = (input: any) => any;

export type SerializationData = {
	name: string,
	serializer: Serializer,
	isConstructed?: boolean;
}

export function Serialize(name: string, serializer?: Serializer, isConstructed?: boolean): (target: any, propertyKey: string) => void {
	return function(target: any, propertyKey: string) {
		Reflect.defineMetadata("serialization", {name, serializer: serializer ?? XMLValue, isConstructed}, target, propertyKey);
	}
}

export function serializeObject(target: Serializable): any {
	let serialized = {};

	for (const property of Object.entries(target)) {
		const data: SerializationData = Reflect.getMetadata("serialization", target, property[0]);
		if (data === undefined) continue;
		const obj = data.isConstructed ? data.serializer(property[1]) : {[data.name]: data.serializer(property[1])}
		serialized = {...serialized, ...obj};
	}

	return serialized;
}