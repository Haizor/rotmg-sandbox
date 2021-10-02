import { Data } from "common/asset/normal/Serializable";
import Behavior, { XMLBehavior } from "./Behavior";

@XMLBehavior()
export default class Circle extends Behavior {
	@Data("@_acquireRange")
	acquireRange: number = 15;
	@Data("@_distance")
	distance: number = 8;
	@Data("@_speed")
	speed: number = 1;

	get name(): string { return "Circle" }
	get angularVelocity() : number { return this.speed / this.distance; }
}