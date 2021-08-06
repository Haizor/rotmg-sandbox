import { mat4 } from "gl-matrix";
import Camera from "../../engine/Camera";
import PlayerObject from "./PlayerObject";

export default class PlayerCamera extends Camera {
	player: PlayerObject;

	constructor(player: PlayerObject) {
		super();
		this.player = player;
	}
	
	getViewMatrix(): mat4 {
		const matrix = mat4.create();
		// mat4.perspective(
		// 	matrix,
		// 	90 * (Math.PI / 180),
		// 	1,
		// 	0.1,
		// 	100
		// )
		mat4.translate(matrix, matrix, [0, 0, -10]);
		mat4.rotateX(matrix, matrix, 45 * (Math.PI / 180))
		mat4.rotateZ(matrix, matrix, this.player.rotation);
		mat4.translate(matrix, matrix, [-this.player.position.x, -this.player.position.y, 0]);

		return matrix;
	}

	getProjectionMatrix() {
		const matrix = mat4.create();
		mat4.ortho(matrix, 1, -1, 1, -1, 0.1, 1000);
		mat4.scale(matrix, matrix, [0.2, 0.2, 1]);
		return matrix;
	}
}