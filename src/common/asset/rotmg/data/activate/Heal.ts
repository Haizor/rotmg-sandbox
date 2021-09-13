import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class Heal implements Activate {
	@Data("@_amount")
	amount: number = 0;

	getName(): string {
		return "Heal";
	}
}