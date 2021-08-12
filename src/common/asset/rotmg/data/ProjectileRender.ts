import { Serialize, XMLNoDefault } from "common/asset/normal/Serializable";
import XMLObject from "./XMLObject";

export default class ProjectileRender extends XMLObject {
	@Serialize("AngleCorrection", XMLNoDefault(0))
	angleCorrection: number = 0;
	@Serialize("Rotation", XMLNoDefault(0))
	rotation: number = 0;
}