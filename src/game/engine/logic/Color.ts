export default class Color {
	r: number;
	g: number;
	b: number;
	a: number;

	static get Black(): Color {
		return new Color(0, 0, 0, 1);
	}

	constructor(r: number, g: number, b: number, a: number) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	static lerp(colorA: Color, colorB: Color, value: number): Color {
		const r = (colorA.r * value) + (colorB.r * (1 - value));
		const g = (colorA.g * value) + (colorB.g * (1 - value));
		const b = (colorA.b * value) + (colorB.b * (1 - value));
		const a = (colorA.a * value) + (colorB.a * (1 - value));
		return new Color(r, g, b, a);
	}
}