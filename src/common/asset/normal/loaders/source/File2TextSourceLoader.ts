import SourceLoader from "./SourceLoader";
import JSZip from "jszip";

export default class File2TextSourceLoader implements SourceLoader<JSZip.JSZipObject, string> {
	async convert(src: JSZip.JSZipObject): Promise<string> {
		return await src.async("string");
	}
}