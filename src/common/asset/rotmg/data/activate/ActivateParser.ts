export const activateConstructors = new Map();

export function XMLActivate() {
	return (constructor: Function) => {
		activateConstructors.set(constructor.prototype.getName(), constructor);
	}
}

export default class ActivateParser {
	static fromXML(xml: any): any | undefined {
		const activateName = xml["#text"] ?? xml;

		const constructor = activateConstructors.get(activateName);
		if (constructor !== undefined) {
			const obj = new constructor(xml);
			// for (const [key, value] of Object.entries(xml)) {
			// 	if (key.indexOf("@_") !== -1) {
			// 		const attributeName = key.replace("@_", "");
			// 		obj[attributeName] = value;
			// 	}
			// }
			return obj;
		}

		return;
	}
}