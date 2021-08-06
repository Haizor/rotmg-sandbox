import AssetLoader from "./AssetLoader";
import AssetManager from "./AssetManager";
import { ShaderMap } from "./ShaderAssetLoader";

export default class ProgramAssetLoader implements AssetLoader<ProgramConfig, ProgramMap> {
	gl: WebGLRenderingContext;
	manager: AssetManager;

	//TODO: try and find a better way to get the shaders, because this feels pooby
	constructor(gl: WebGLRenderingContext, manager: AssetManager) {
		this.gl = gl;
		this.manager = manager;
	}

	async load(sources: ProgramConfig[]): Promise<ProgramMap> {
		const programs: ProgramMap = new Map();
		for (const src of sources) {
			const vertex = this.manager.get<ShaderMap>("shaders").get(src.vertex);
			const fragment = this.manager.get<ShaderMap>("shaders").get(src.fragment);

			if (vertex === undefined || fragment === undefined) {
				console.error(`Failed to create program with name '${src.name}', failed to load shaders!`);
				continue;
			}

			const program = this.gl.createProgram();
			if (program === null) {
				console.error(`Failed to create program with name '${src.name}'!`);
				continue;
			}

			this.gl.attachShader(program, vertex);
			this.gl.attachShader(program, fragment);
			this.gl.linkProgram(program);

			if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
				console.error(`Failed to link program with name '${src.name}'!`);
				continue;
			}

			programs.set(src.name, program);
		}
		return programs;
	}
}

export type ProgramConfig = {
	name: string,
	vertex: string,
	fragment: string
}
export type ProgramMap = Map<string, WebGLProgram>