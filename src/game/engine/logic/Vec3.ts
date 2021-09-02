import { vec3, vec4 } from "gl-matrix";

export default class Vec3 {
	x: number;
	y: number;
	z: number;
	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(vec: Vec3): Vec3 {
		return new Vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
	}

	subtract(vec: Vec3): Vec3 {
		return new Vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
	}

	mult(vec: Vec3): Vec3 {
		return new Vec3(this.x * vec.x, this.y * vec.y, this.z * vec.z);
	}

	toGlMatrixVec(): vec3 {
		return vec3.fromValues(this.x, this.y, this.z);
	}

	normalize(): Vec3 {
		const max = Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
		return new Vec3(this.x / max, this.y / max, this.z / max);
	}

	toString() {
		return `Vec3[x=${this.x},y=${this.y},z=${this.z}]`
	}

	static fromValues(values: vec4) {
		return new Vec3(values[0], values[1], values[2])
	}

	static get Zero(): Vec3 {
		return new Vec3(0, 0, 0);
	}
}