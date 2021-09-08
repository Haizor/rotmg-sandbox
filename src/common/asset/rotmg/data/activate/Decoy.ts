import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class Decoy implements Activate {
	@Data("@_duration")
	duration: number = 3;
	@Data("@_speed")
	speed: number = 1;
	@Data("@_distance")
	distance: number = 8;
	@Data("@_angleOffset")
	angleOffset: number = 0;

	getName(): string {
		return "Decoy";
	}
}