import { Data } from "common/asset/normal/Serializable";
import Behaviour, { XMLBehavior } from "./Behavior";

@XMLBehavior()
export default class Shoot extends Behaviour {
	@Data("@_projectileId")
	projectileId: number = 1;
	@Data("@_range")
	range: number = 7;
}