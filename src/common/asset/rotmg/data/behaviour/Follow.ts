import { Data } from "common/asset/normal/Serializable";
import Behavior, { XMLBehavior } from "./Behavior";

@XMLBehavior()
export default class Follow extends Behavior {
	@Data("@_range")
	range: number = 7;
	@Data("@_speed")
	speed: number = 0.6;

	get name(): string { return "Follow" }
}