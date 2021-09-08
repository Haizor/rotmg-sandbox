import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class Teleport implements Activate {
	@Data("@_maxDistance")
	maxDistance: number = 13;

	getName(): string {
		return "Teleport";
	}
}