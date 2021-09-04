import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate("BoostRange")
export default class BoostRange implements Activate {
	radius: number = 4;
	speedBoost: number = 1.25;
	lifeBoost: number = 1;
	duration: number = 3;
	targeted: boolean = false;

	constructor(xml: any) {
		this.radius = xml["@_radius"]
		this.speedBoost = xml["@_speedBoost"];
		this.lifeBoost = xml["@_lifeBoost"];
		this.duration = xml["@_duration"];
		this.targeted = xml["@_targeted"];
	}

	getName(): string {
		return "BoostRange"
	}
}