import BufferManager from "./BufferManager";

export default class GLManager {
	gl: WebGLRenderingContext;
	bufferManager: BufferManager;
	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.bufferManager = new BufferManager(gl);
	}
}