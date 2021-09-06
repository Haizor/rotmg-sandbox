import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class BulletNova implements Activate {
	@Data("@_numShots")
	numShots: number = 16;
	@Data("@_color")
	color: string = "FF00AA";

	getName(): string {
		return "BulletNova"
	}
}