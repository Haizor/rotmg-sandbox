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
			return new constructor(xml)
		}

		return;
	}
}