import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("Shoot")
export default class Shoot implements Activate {
	getName(): string {
		return "Shoot"
	}
}