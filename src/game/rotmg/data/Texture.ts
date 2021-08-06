export default class Texture {
	file: string = ""
	index: number = 0
	animated: boolean = false;

	constructor(file: string, index: number, animated: boolean) {
		this.file = file;
		this.index = index;
		this.animated = animated;
	}

	//TODO: support random textures
	static fromXML(xml: any) {
		
	}
}
