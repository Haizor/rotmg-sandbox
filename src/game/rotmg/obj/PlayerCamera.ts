import { mat4, vec4 } from "gl-matrix";
import Camera from "../../engine/Camera";
import Vec2 from "../../engine/logic/Vec2";
import PlayerObject from "./PlayerObject";

export default class PlayerCamera extends Camera {
	player: PlayerObject;
	zoom: number = 10;

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
		mat4.rotateX(matrix, matrix, 30 * (Math.PI / 180))
		mat4.rotateZ(matrix, matrix, (180 + this.player.rotation) * (Math.PI / 180));
		mat4.translate(matrix, matrix, [-this.player.position.x, -this.player.position.y, 0]);

		return matrix;
	}

	getProjectionMatrix() {
		const matrix = mat4.create();
		mat4.ortho(matrix, this.zoom, -this.zoom, this.zoom, -this.zoom, 0.1, 1000);
		return matrix;
	}
}