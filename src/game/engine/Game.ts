import GLManager from "./webgl/GLManager";
import Scene from "./logic/Scene";
import { InputController } from "./logic/InputController";
import { AssetManager, AssetManagerConfig } from "rotmg-utils";

export default class Game {
	canvas: HTMLCanvasElement;
	gl: WebGLRenderingContext;
	glManager: GLManager;
	scene: Scene;
	assetManager: AssetManager;
	inputController: InputController;
	time: number = -1;

	constructor(canvas: HTMLCanvasElement, assetManager?: AssetManager) {
		this.canvas = canvas;
		const gl = this.canvas.getContext("webgl");
		if (gl === null) {
			throw new Error("Unable to get WebGL context!");
		}
		this.gl = gl;
		this.glManager = new GLManager(gl);
		this.inputController = new InputController(canvas);

		this.assetManager = assetManager || new AssetManager();
		this.populateAssetManager();
		this.assetManager.load(this.getAssetConfig()).then(() => {
			this.onAssetsLoaded();
		})

		this.scene = new Scene(this);
	}

	getAssetConfig(): AssetManagerConfig {
		return {
			name: "base",
			containers: []
		}
	}

	populateAssetManager(): AssetManager {
		return this.assetManager;
	}

	onAssetsLoaded(): void {
		requestAnimationFrame((time) => this.render(time))
	}

	stop() {
		this.scene.stop();
	}

	render(time: number) {
		if (this.time === -1) {
			this.time = time;
		}
		const elapsed = time - this.time;

		this.scene.update(elapsed);
		this.scene.render(elapsed, this.gl, this.glManager);
		requestAnimationFrame((time) => this.render(time))
		this.inputController.update()
		this.time = time;
	}
}