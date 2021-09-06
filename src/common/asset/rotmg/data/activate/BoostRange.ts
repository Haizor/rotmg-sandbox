import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class BoostRange implements Activate {
	@Data("@_radius")
	radius: number = 4;
	@Data("@_speedBost")
	speedBoost: number = 1.25;
	@Data("@_lifeBoost")
	lifeBoost: number = 1;
	@Data("@_duration")
	duration: number = 3;
	@Data("@_targeted", XMLBoolean)
	targeted: boolean = false;

	getName(): string {
		return "BoostRange"
	}
}