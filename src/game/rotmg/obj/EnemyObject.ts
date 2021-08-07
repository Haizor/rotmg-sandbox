import RotMGAssets from "../asset/RotMGAssets";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import RotMGObject from "./RotMGObject";

export default class EnemyObject extends LivingObject {
	preventsMovement() {
		return false;
	}

	getSprite() {
		const game = this.getGame() as RotMGGame;
		const data = game.assetManager.get<RotMGAssets>("rotmg").getObjectFromId("Rogue");
		return game.renderHelper?.getSpritesFromObject(data)[0];
	}
}