import { mat4, vec4 } from "gl-matrix";
import Vec2 from "./logic/Vec2";

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
		//TODO: figure out actual math for this
		const clipNear = vec4.fromValues(clipPos.x, (clipPos.y + 0.85), -1, 1);
		const pos = vec4.transformMat4(vec4.create(), clipNear, invMatrix);
		return new Vec2(pos[0], pos[1])
	}
}