import { AssetLoader, AssetContainer, AssetManager } from "@haizor/rotmg-utils";
import MapAssetContainer from "@haizor/rotmg-utils/dist/asset/normal/MapAssetContainer";

export class ProgramAssetLoader implements AssetLoader<ProgramConfig, AssetContainer<ProgramInfo>> {
	gl: WebGLRenderingContext;
	manager: AssetManager;

	//TODO: try and find a better way to get the shaders, because this feels pooby
	constructor(gl: WebGLRenderingContext, manager: AssetManager) {
		this.gl = gl;
		this.manager = manager;
	}

	async load(sources: ProgramConfig[]): Promise<AssetContainer<ProgramInfo>> {
		const programs: Map<string, ProgramInfo> = new Map();

		for (const src of sources) {
			const vertex = this.manager.get<WebGLShader>("shaders", src.vertex)?.value;
			const fragment = this.manager.get<WebGLShader>("shaders", src.fragment)?.value;

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

			this.gl.useProgram(program);

			let info: ProgramInfo = {
				program,
				attribs: {},
				uniforms: {}
			}

			if (src.attribs) {
				for (const attrib of src.attribs) {
					const buffer = this.gl.createBuffer() as WebGLBuffer;
					const location = this.gl.getAttribLocation(program, attrib);

					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
					this.gl.enableVertexAttribArray(location);
					info.attribs[attrib] = {
						buffer, location
					}
				}
			}

			if (src.uniforms) {
				for (const uniform of src.uniforms) {
					info.uniforms[uniform] = this.gl.getUniformLocation(program, uniform);
				}
			}

			programs.set(src.name, info);
		}
		return new MapAssetContainer(programs);
	}
}

export type ProgramConfig = {
	name: string;
	vertex: string;
	fragment: string;
	attribs?: string[];
	uniforms?: string[];
}

export type ProgramInfo = {
	program: WebGLProgram;
	attribs: {
		[key: string]: Attrib;
	}
	uniforms: {
		[key: string]: WebGLUniformLocation | null;
	}
}

export type Attrib = {
	location: number;
	buffer: WebGLBuffer;
}