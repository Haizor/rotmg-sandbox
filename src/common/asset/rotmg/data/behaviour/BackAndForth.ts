import { Data } from "common/asset/normal/Serializable";
import Behavior, { XMLBehavior } from "./Behavior";

@XMLBehavior()
export default class BackAndForth extends Behavior {
	@Data("@_speed")
	speed: number = 1;
	@Data("@_angle")
	angle: number = 0;
	@Data("@_turnRate")
	turnRate: number = 0;
	@Data("@_radius")
	radius: number = 0;

	get name(): string { return "BackAndForth" }
}