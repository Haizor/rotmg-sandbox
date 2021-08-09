import Activate from "../../common/asset/rotmg/data/activate/Activate";
import IncrementStat from "../../common/asset/rotmg/data/activate/IncrementStat";
import PlayerObject from "./obj/PlayerObject";

export default class ActivateProcessor  {
	player: PlayerObject;
	constructor(player: PlayerObject) {
		this.player = player;
	}

	process(activate: Activate) {
		if (activate instanceof IncrementStat) {
			this.player.manager.addStats((activate as IncrementStat).stats);
		}
	}
}