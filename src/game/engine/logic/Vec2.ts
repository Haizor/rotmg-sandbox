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

	floor(): Vec2 {
		return new Vec2(Math.floor(this.x), Math.floor(this.y))
	}

	round(): Vec2 {
		return new Vec2(Math.round(this.x), Math.round(this.y));
	}

	normalize(): Vec2 {
		const max = Math.max(Math.abs(this.x), Math.abs(this.y));
		return new Vec2(this.x / max, this.y / max);
	}

	toString() {
		return `Vec2[x=${this.x},y=${this.y}]`
	}

	static dist(vecA: Vec2, vecB: Vec2): number {
		return Math.sqrt(Math.pow(vecB.x - vecA.x, 2) + Math.pow(vecB.y - vecA.y, 2));
	}

	static angleBetween(vecA: Vec2, vecB: Vec2): number {
		return (Math.atan2(-vecB.y + vecA.y, vecB.x - vecA.x) * (180 / Math.PI)) + 180;
	}

	static get Zero(): Vec2 {
		return new Vec2(0, 0);
	};
}