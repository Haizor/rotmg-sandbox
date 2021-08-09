import LivingObject from "./LivingObject";

export default class EnemyObject extends LivingObject {
	preventsMovement() {
		return false;
	}

	
}