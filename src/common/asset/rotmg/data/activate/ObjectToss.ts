import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ObjectToss implements Activate {
	objectId: string;
	throwTime: number;
	color: number;
	constructor(xml: any) {
		this.objectId = xml["@_objectId"];
		this.throwTime = xml["@_throwTime"];
		this.color = xml["@_color"] ?? 0xFFC600
	}

	getName(): string {
		return "ObjectToss";
	}
}