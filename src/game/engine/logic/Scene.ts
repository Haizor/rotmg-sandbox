import { ProgramInfo } from "common/loaders/ProgramAssetLoader";
import { mat4, vec3 } from "gl-matrix";
import Camera from "../Camera";
import Game from "../Game";
import GameObject from "../obj/GameObject";
import GLManager from "../webgl/GLManager";
import Vec2 from "./Vec2";

export default class Scene {
	game: Game;
	camera: Camera;
	private objects: Map<number, GameObject>;
	private _taggedObjects: Map<string, Map<number, GameObject>> = new Map();
	private _objId = 0;

	private _programCache: Map<string, ProgramInfo> = new Map();

	constructor(game: Game) {
		this.game = game;
		this.camera = new Camera();
		this.objects = new Map();
	}

	addObject(obj: GameObject) {
		obj.id = this._objId++;
		this.objects.set(obj.id, obj); 
		for (const tag of obj.getTags()) {
			if (!this._taggedObjects.has(tag)) {
				this._taggedObjects.set(tag, new Map());
			}
			this._taggedObjects.get(tag)?.set(obj.id, obj);
		}
		obj.setScene(this);
	}

	deleteObject(obj: GameObject) {
		this.objects.delete(obj.id);
		for (const tag of obj.getTags()) {
			if (this._taggedObjects.has(tag)) {
				this._taggedObjects.get(tag)?.delete(obj.id);
			}
		}
	}

	getObjects(): GameObject[] {
		return [...this.objects.values()]
	}

	getObjectsWithinRange(options: {
		position: Vec2,
		radius: number,
		tag?: string
	}): GameObject[] {
		const result = [];
		const objects = options.tag !== undefined && this._taggedObjects.has(options.tag) ? (this._taggedObjects.get(options.tag) as Map<number, GameObject>).values() : this.objects.values();
		for (const obj of objects) {
			if (Vec2.dist(options.position, obj.position) <= options.radius) {
				result.push(obj);
			}
		}
		return result;
	}

	getObjectsWithTag(tag: string): GameObject[] {
		if (!this._taggedObjects.has(tag)) return [];
		return [...(this._taggedObjects.get(tag) as Map<number, GameObject>).values()]
	}

	update(elapsed: number) {
		for (const obj of this.objects.values()) {
			obj.update(16.67);
		}
	}

	render(elapsed: number, gl: WebGLRenderingContext) {
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

			const programName = obj.getProgramName() ?? "";
			let programInfo: ProgramInfo | undefined;
			if (this._programCache.has(programName)) {
				programInfo = this._programCache.get(programName);
			} else {
				programInfo = this.game.assetManager.get<ProgramInfo>("programs", programName)?.value;
			}
			if (programInfo === undefined) {
				continue;
			}

			gl.useProgram(programInfo.program);
			gl.uniformMatrix4fv(
				programInfo.uniforms["uProjectionMatrix"],
				false,
				cameraProjectionMatrix
			);
			gl.uniformMatrix4fv(
				programInfo.uniforms["uViewMatrix"],
				false,
				cameraViewMatrix
			);
			obj.render({elapsed, gl, programInfo})
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