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
}