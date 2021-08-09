import { assetManager } from "../Assets";
import Equipment from "../game/rotmg/data/Equipment";
import Player from "../game/rotmg/data/Player";
import Inventory from "./Inventory";

export default class PlayerInventory extends Inventory {
	constructor() {
		super(12);
	}


	//TODO: temporary access to asset manager, how fix
	setClass(clazz: Player) {
		for (let i = 0; i < this.size; i++) {
			const slot = this.slots[i]
			slot.type = clazz.slotTypes[i]
			if (slot.getItem() === undefined || !slot.canFit(slot.getItem())) {
				if (clazz.equipment[i] !== -1) {
					slot.setItem(assetManager.get<Equipment>("rotmg", clazz.equipment[i])?.value.createInstance());
				} else slot.setItem(undefined);
			}
		}

	}
}