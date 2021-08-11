import AssetLoader from "./AssetLoader";
import MapAssetContainer from "./MapAssetContainer";

export default class ShaderAssetLoader implements AssetLoader<ShaderConfig, MapAssetContainer<WebGLShader>> {
	gl: WebGLRenderingContext;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	//TODO: make this actually asynchronous
	async load(sources: ShaderConfig[]): Promise<MapAssetContainer<WebGLShader>> {
		const shaders: ShaderMap = new Map();
		for (const src of sources) {
			const txt = await (await fetch(src.src)).text();
			const shader = this.gl.createShader(src.type === "vertex" ? this.gl.VERTEX_SHADER : this.gl.FRAGMENT_SHADER);
			if (shader === null) {
				console.log(`Failed to create shader with name '${src.name}'!`);
				continue;
			}
			this.gl.shaderSource(shader, txt);
			this.gl.compileShader(shader);
			
			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
				console.log(`Failed to compile shader with name '${src.name}'! Info: ${this.gl.getShaderInfoLog(shader)}`);
				continue;
			}

			shaders.set(src.name, shader);
		}
		return new MapAssetContainer(shaders);
	}
}

type ShaderConfig = {
	name: string,
	src: string,
	type: "vertex" | "fragment"
}

export type ShaderMap = Map<string, WebGLShader>