import ObjectClass from "./ObjectClass";
import Texture from "./Texture";

export default class XMLObject {
	type: number = -1;
	id: string = "";
	class: ObjectClass = ObjectClass.GameObject;
	texture?: Texture;

	getDisplayName(): string {
		return this.id;
	}
}
