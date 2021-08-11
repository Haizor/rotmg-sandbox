import SourceLoader from "./SourceLoader";

export default class Url2TextSourceLoader implements SourceLoader<string, string> {
	async convert(src: string): Promise<string> {
		return (await fetch(src)).text();
	}
}