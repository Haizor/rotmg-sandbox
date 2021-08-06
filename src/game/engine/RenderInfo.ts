import GLManager from "./webgl/GLManager";

export default interface RenderInfo {
	gl: WebGLRenderingContext;
	manager: GLManager;
	program: WebGLProgram;
	elapsed: number;
}