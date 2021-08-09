import { SlotType } from "../game/rotmg/data/Equipment";
import Player from "../game/rotmg/data/Player";
import Inventory from "./Inventory";

export default class PlayerInventory extends Inventory {
	constructor() {
		super(12);

	}

	setClass(clazz: Player) {
		for (let i = 0; i < this.size; i++) {
			this.slots[i].type = clazz.slotTypes[i]
		}
	}
}