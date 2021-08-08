import RotMGAssets from "../asset/RotMGAssets";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";

export default class EnemyObject extends LivingObject {
	preventsMovement() {
		return false;
	}
}