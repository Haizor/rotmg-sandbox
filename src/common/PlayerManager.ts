import Player from "../game/rotmg/data/Player";
import PlayerInventory from "./PlayerInventory";

export default class PlayerManager {
	class: Player | undefined;
	inventory: PlayerInventory;
	constructor() {
		this.inventory = new PlayerInventory();
	}

	setClass(clazz: Player | undefined) {

		if (clazz !== undefined) {
			this.class = clazz;
			this.inventory.setClass(clazz);
		}
	}
}