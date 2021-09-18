import Vec3 from "./Vec3";

export default class Vec2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(x: number, y: number): Vec2
	add(vec: Vec2): Vec2
	add(x: number | Vec2, y?: number): Vec2 {
		if (x instanceof Vec2) return new Vec2(this.x + x.x, this.y + x.y)
		else if (y !== undefined) return new Vec2(this.x + x, this.y + y)
		return this;
	}

	subtract(x: number, y: number): Vec2
	subtract(vec: Vec2): Vec2
	subtract(x: number | Vec2, y?: number): Vec2 {
		if (x instanceof Vec2) return new Vec2(this.x - x.x, this.y - x.y);
		else if (y !== undefined) return new Vec2(this.x - x, this.y- y);
		return this;
	}

	mult(x: number, y: number): Vec2;
	mult(mult: number): Vec2;
	mult(vec: Vec2): Vec2;
	mult(x: number | Vec2, y?: number): Vec2 {
		if (x instanceof Vec2) return new Vec2(this.x * x.x, this.y * x.y);
		else if (y === undefined) return new Vec2(this.x * x, this.y * x);
		else if (y !== undefined) return new Vec2(this.x * x, this.y * y);
		return this;
	}

	rotate(rad: number) {
		const xA = (this.x * Math.cos(rad) - (this.y * Math.sin(rad)));
		const yA = (this.x * Math.sin(rad) + (this.y * Math.cos(rad)));
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

	copy(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	toString() {
		return `Vec2[x=${this.x},y=${this.y}]`
	}

	toVec3(z: number) {
		return new Vec3(this.x, this.y, z);
	}

	static dist(vecA: Vec2, vecB: Vec2): number {
		return Math.sqrt(Math.pow(vecB.x - vecA.x, 2) + Math.pow(vecB.y - vecA.y, 2));
	}

	static lerp(a: Vec2, b: Vec2, interp: number): Vec2 {
		const direction = b.subtract(a).mult(interp);
		return a.add(direction);
	}

	static angleBetween(vecA: Vec2, vecB: Vec2): number {
		return (Math.atan2(vecB.y - vecA.y, vecB.x - vecA.x) * (180 / Math.PI));
	}

	static get Zero(): Vec2 {
		return new Vec2(0, 0);
	};

	static random(negative?: boolean) {
		const vec = new Vec2(Math.random(), Math.random());
		if (negative === true) {
			vec.x -= 0.5;
			vec.y -= 0.5;
		}
		return vec;
	}
}