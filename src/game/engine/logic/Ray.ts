import Vec3 from "./Vec3";

export class Ray {
	start: Vec3;
	point: Vec3;

	get direction(): Vec3 {
		return this.point.subtract(this.start).normalize();
	}

	constructor(start: Vec3, point: Vec3) {
		this.start = start;
		this.point = point;
	}

	whereZ(z: number) {
		const dist = this.start.z - z;
		return this.start.add(this.direction.mult(new Vec3(dist, dist, dist)))
	}
}