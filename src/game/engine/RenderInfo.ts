import { ProgramInfo } from "common/loaders/ProgramAssetLoader";
import GLManager from "./webgl/GLManager";

export default interface RenderInfo {
	gl: WebGLRenderingContext;
	programInfo: ProgramInfo;
	elapsed: number;
}