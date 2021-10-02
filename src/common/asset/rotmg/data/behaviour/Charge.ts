import { Data } from "common/asset/normal/Serializable";
import Behavior, { XMLBehavior } from "./Behavior";

@XMLBehavior()
export default class Charge extends Behavior {
	@Data("@_speed")
	speed: number = 3;
	@Data("@_range")
	range: number = 20;

	get name(): string { return "Charge" }
}