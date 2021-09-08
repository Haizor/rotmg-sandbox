export default class Color {
	r: number;
	g: number;
	b: number;
	a: number;

	static get Red(): Color {
		return new Color(1, 0, 0, 1);
	}

	static get Black(): Color {
		return new Color(0, 0, 0, 1);
	}

	static get Yellow(): Color {
		return new Color(1, 1, 0, 1);
	}

	static get Purple(): Color {
		return new Color(0.5, 0, 1, 1);
	}

	static get White(): Color {
		return new Color(1, 1, 1, 1);
	}

	constructor(r: number, g: number, b: number, a: number) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	toHex(): string {
		function componentToHex(c: number) {
			const hex = Math.floor(c).toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		}
		return "#" + componentToHex(this.r * 255) + componentToHex(this.g * 255) + componentToHex(this.b * 255) + componentToHex(this.a * 255);
	}
	
	static fromHexNumber(num: number): Color {
		num >>>= 0;
    	let b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ((num & 0xFF000000) >>> 24 ) / 255 || 1;
		return new Color(r / 255, g / 255, b / 255, a)
	}

	static fromHexString(str: string): Color {
		var bigint = parseInt(str, 16);
		var r = (bigint >> 16) & 255;
		var g = (bigint >> 8) & 255;
		var b = bigint & 255;

		return new Color(r, g, b, 1);
	}

	static lerp(colorA: Color, colorB: Color, value: number): Color {
		const r = (colorA.r * value) + (colorB.r * (1 - value));
		const g = (colorA.g * value) + (colorB.g * (1 - value));
		const b = (colorA.b * value) + (colorB.b * (1 - value));
		const a = (colorA.a * value) + (colorB.a * (1 - value));
		return new Color(r, g, b, a);
	}
}

export const ColorData = {
	serialize: (color: Color) => { return color.toHex() },
	deserialize: (data: any) => {
		if (data === undefined) return;
		if (typeof(data) === "string") {
			return Color.fromHexString(data);
		} else if (typeof(data) === "number") {
			return Color.fromHexNumber(data);
		}
	}
}