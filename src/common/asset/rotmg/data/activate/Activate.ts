export function ActivateSerializer(value: Activate[]) {
	return value.map((activate: Activate) => {
		if (activate === undefined) return undefined;
		const data: any = {
			"#text": activate.getName()
		}

		for (const [key, value] of Object.entries(activate)) {
			data[`@_${key}`] = value;
		}
		return data;
	})
}

export default interface Activate {
	getName(): string
}