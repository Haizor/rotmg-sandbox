import { vec3 } from "gl-matrix";
import Vec2 from "./Vec2";

export default class Vec3 extends Vec2 {
	z: number;
	constructor(x: number, y: number, z: number) {
		super(x, y);
		this.z = z;
	}

	toGlMatrixVec(): vec3 {
		return vec3.fromValues(this.x, this.y, this.z);
	}

	static get Zero(): Vec3 {
		return new Vec3(0, 0, 0);
	}
}