import { mat4, vec4 } from "gl-matrix";
import { Ray } from "./logic/Ray";
import Vec2 from "./logic/Vec2";
import Vec3 from "./logic/Vec3";

export default class Camera {
	getProjectionMatrix(): mat4 {
		const matrix = mat4.create();
		mat4.perspective(
			matrix,
			90 * (Math.PI / 180),
			1,
			0.1,
			100
		)
		return matrix;
	}

	getViewMatrix(): mat4 {
		return mat4.create();
	}

	clipToWorldPos(clipPos: Vec2) {
		const projectionView = mat4.mul(mat4.create(), this.getProjectionMatrix(), this.getViewMatrix());
		const invMatrix = mat4.invert(mat4.create(), mat4.mul(mat4.create(), projectionView, mat4.create()));

		const zNear = 0.1;
		const zFar = 1000;
		const clipNear = vec4.fromValues(clipPos.x, clipPos.y, zNear, 1);
		const clipFar = vec4.fromValues(clipPos.x, clipPos.y, zFar, 1);
		
		const posNear = vec4.transformMat4(vec4.create(), clipNear, invMatrix);
		const posFar = vec4.transformMat4(vec4.create(), clipFar, invMatrix);

		const ray = new Ray(Vec3.fromValues(posNear), Vec3.fromValues(posFar));
		const pos = ray.whereZ(1);

		return new Vec2(pos.x, pos.y)
	}
}