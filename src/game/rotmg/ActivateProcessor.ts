import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import Item from "common/asset/rotmg/data/Item";
import Activate from "../../common/asset/rotmg/data/activate/Activate";
import IncrementStat from "../../common/asset/rotmg/data/activate/IncrementStat";
import { PlayerCollisionFilter } from "./obj/CollisionFilter";
import PlayerObject from "./obj/PlayerObject";
import ProjectileObject from "./obj/ProjectileObject";
import RotMGGame from "./RotMGGame";

export default class ActivateProcessor  {
	player: PlayerObject;
	constructor(player: PlayerObject) {
		this.player = player;
	}

	process(equip: Item, activate: Activate) {
		const game = this.player.getGame() as RotMGGame;

		if (activate instanceof IncrementStat) {
			const stats = (activate as IncrementStat).stats;
			this.player.manager.addStats(stats);
			this.player.heal(stats.hp);
		} else if (activate instanceof BulletNova) {
			const pos = game.scene.camera.clipToWorldPos(game.inputController.getMousePos()).round();
			
			for (let i = 0; i < activate.numShots; i++) {
				const angle = i * (360 / activate.numShots);
				const projectile = new ProjectileObject(pos, equip.data.projectiles[0], {
					angle,
					collisionFilter: PlayerCollisionFilter
				});
				game.scene.addObject(projectile);
			}
		} 
	}
}