import "reflect-metadata"

export default interface Serializable {
	serialize(): string;
}

export const XMLValue = {
	serialize: (input: any) => input,
	deserialize: (input: any) => input
}

export const XMLBoolean = {
	serialize: (input: any) => input !== false ? {"#text": ""} : undefined,
	deserialize: (input: any) => input !== undefined
}

export function XMLEnum(e: any) {
	return {
		serialize: (input: any) => e[input],
		deserialize: (input: any) => {
			if (typeof(input) === "number") {
				return input;
			}
			return e[input];
		}
	}
}

export function XMLNoDefault<T>(defaultValue: T) {
	return {
		serialize: (input: T) => {
			if (input === defaultValue) return;
			return input;
		},
		deserialize: (input: any) => input
	}
}

export type DataController<T> = {
	serialize: (input: T) => any;
	deserialize: (input: any) => T;
}

export type SerializationData = {
	name: string,
	controller: DataController<any>,
	options: DataOptions;
}

export type DataOptions = {
	isConstructed?: boolean;
	deserializeFullObject?: boolean;
}

export function Data(name: string, dataController?: DataController<any>, options: DataOptions = {}): (target: any, propertyKey: string) => void {
	return function(target: any, propertyKey: string) {
		Reflect.defineMetadata("data", {name, controller: dataController ?? XMLValue, options}, target, propertyKey);
	}
}

export function serializeObject(target: any): any {
	let serialized = {};

	for (const property of Object.entries(target)) {
		const data: SerializationData = Reflect.getMetadata("data", target, property[0]);
		if (data === undefined) continue;
		const obj = data.options.isConstructed ? data.controller.serialize(property[1]) : {[data.name]: data.controller.serialize(property[1])}
		serialized = {...serialized, ...obj};
	}

	return serialized;
}

export function deserializeObject(target: any, data: any): any {
	for (const property of Object.entries(target)) {
		const dataInfo: SerializationData = Reflect.getMetadata("data", target, property[0]);
		if (dataInfo === undefined) continue;
		//TODO: don't use isconstructed as a replacement
		if (dataInfo.options.deserializeFullObject || dataInfo.options.isConstructed) {
			Object.assign(target, {[property[0]]: dataInfo.controller.deserialize.call(target, data)});
		} else {
			const deserialized = dataInfo.controller.deserialize.call(target, data[dataInfo.name]);
			if (deserialized !== undefined)
			Object.assign(target, {[property[0]]: deserialized})
		}
	}
	// console.log(target)
} 