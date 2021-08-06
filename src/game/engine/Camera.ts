import { mat4 } from "gl-matrix";
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
		
	}
}