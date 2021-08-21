import { mat4, vec3 } from "gl-matrix";
import Camera from "../Camera";
import Game from "../Game";
import GameObject from "../obj/GameObject";
import GLManager from "../webgl/GLManager";

export default class Scene {
	game: Game;
	camera: Camera;
	objects: Map<number, GameObject>;
	private _objId = 0;
	constructor(game: Game) {
		this.game = game;
		this.camera = new Camera();
		this.objects = new Map();
	}

	addObject(obj: GameObject) {
		obj.id = this._objId++;
		obj.setScene(this);
		this.objects.set(obj.id, obj); 
	}

	update(elapsed: number) {
		for (const obj of this.objects.values()) {
			obj.update(16.67);
		}
	}

	render(elapsed: number, gl: WebGLRenderingContext, manager: GLManager) {
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
		gl.clearColor(1, 1, 1, 1);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		const cameraProjectionMatrix = this.camera.getProjectionMatrix();
		const cameraViewMatrix = this.camera.getViewMatrix();

		const cameraPos = vec3.create();
		mat4.getTranslation(cameraPos, cameraViewMatrix);
		
		for (const obj of Array.from(this.objects.values()).sort((a, b) => this.renderSorter(cameraPos, a, b))) {
			const program = obj.getProgram(this.game.assetManager);
			if (program === undefined) {
				continue;
			}
			gl.useProgram(program);
			gl.uniformMatrix4fv(
				gl.getUniformLocation(program, "uProjectionMatrix"),
				false,
				cameraProjectionMatrix
			);
			gl.uniformMatrix4fv(
				gl.getUniformLocation(program, "uViewMatrix"),
				false,
				cameraViewMatrix
			);
			obj.render({elapsed, manager, gl, program})
		}
	}

	renderSorter(cameraPos: vec3, a: GameObject, b: GameObject): number {
		const order = a.renderPriority - b.renderPriority;
		return order;
	}

	stop() {
		for (const obj of this.objects.values()) {
			obj.onDeleted();
		}
	}
}