export default class GLHelper {
	public static createShader(gl: WebGLRenderingContext, type: number, source: string) {
		const shader = gl.createShader(type);
		if (shader === null) {
			throw new Error("Failed to create shader!");
		}
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}

	public static createProgram(gl: WebGLRenderingContext, vertex: WebGLShader, fragment: WebGLShader) {
		const program = gl.createProgram();
		if (program === null) {
			throw new Error("Failed to create program;");
		}
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error("Failed to link program!");
		}
		return program;
	}
}