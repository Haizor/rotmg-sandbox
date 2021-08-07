export default class Vec2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(vec: Vec2): Vec2 {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	subtract(vec: Vec2): Vec2 {
		return new Vec2(this.x - vec.x, this.y - vec.y);
	}

	mult(vec: Vec2): Vec2 {
		return new Vec2(this.x * vec.x, this.y * vec.y);
	}

	rotate(rad: number) {
		const xA = (this.x * Math.sin(rad) - (this.y * Math.cos(rad)));
		const yA = (this.x * Math.cos(rad) + (this.y * Math.sin(rad)));
		return new Vec2(xA, yA);
	}

	toString() {
		return `Vec2[x=${this.x},y=${this.y}]`
	}

	static get Zero(): Vec2 {
		return new Vec2(0, 0);
	};
}