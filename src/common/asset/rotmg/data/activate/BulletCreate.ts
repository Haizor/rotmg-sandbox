import { Data } from "common/asset/normal/Serializable";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class BulletCreate implements Activate {
	@Data("@_targetMouse")
	targetMouse: boolean = false;
	@Data("@_minDistance")
	minDistance: number = 0;
	@Data("@_maxDistance")
	maxDistance: number = 4.4;
	@Data("@_offsetAngle")
	offsetAngle: number = 90;
	@Data("@_numShots")
	numShots: number = 1;
	@Data("@_gapAngle")
	gapAngle: number = 45;
	@Data("@_gapTiles")
	gapTiles: number = 0.4;
	@Data("@_arcGap")
	arcGap: number = 0;
	@Data("@_type")
	type?: number

	getName(): string {
		return "BulletCreate";
	}
}