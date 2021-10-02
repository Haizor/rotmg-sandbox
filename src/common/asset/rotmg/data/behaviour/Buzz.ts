import { Data } from "common/asset/normal/Serializable";
import Behavior from "./Behavior";

export default class Buzz extends Behavior {
	@Data("@_speed")
	speed: number = 15;
	@Data("@_acceleration")
	acceleration: number = 5;
	@Data("@_turnRate")
	turnRate: number = Math.PI;
	@Data("@_acquireRange")
	acquireRange: number = 20;
	@Data("@_cooldown")
	cooldown: number = 2;

	get name(): string { return "Buzz" }
}