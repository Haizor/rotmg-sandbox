import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ObjectToss implements Activate {
	@Data("@_objectId")
	objectId: string = "";
	@Data("@_throwTime")
	throwTime: number = 1;
	@Data("@_color")
	color: number = 0xFFC600;

	getName(): string {
		return "ObjectToss";
	}
}