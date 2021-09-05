import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class Shoot implements Activate {
	getName(): string {
		return "Shoot"
	}
}