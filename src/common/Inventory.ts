import { EventEmitter } from "./EventEmitter";
import { SlotType } from "../game/rotmg/data/Equipment";
import Item from "../game/rotmg/data/Item";

export default class Inventory extends EventEmitter {
	slots: Slot[] = [];
	size: number;
	constructor(size: number) {
		super();
		this.size = size;
		for (let i = 0; i < size; i++) {
			this.slots[i] = new Slot();
		}
	}

	getItem(slot: number): Item | undefined {
		if (slot > this.size) {
			return;
		}
		return this.slots[slot].getItem();
	}

	setItem(slot: number, item: Item) {
		if (slot > this.size) {
			return;
		}
		const oldItem = this.slots[slot].getItem();
		this.slots[slot].setItem(item);

	}
}

export class Slot extends EventEmitter {
	type?: SlotType;
	item?: Item;
	constructor(type?: SlotType) {
		super();
		this.type = type;
	}

	getItem(): Item | undefined {
		return this.item;
	}

	canFit(item: Item | undefined): boolean {
		if (item !== undefined && this.type !== undefined && item.data.slotType !== this.type) {
			return false;
		}
		return true;
	}

	setItem(item: Item | undefined): void {
		if (this.canFit(item)) {
			const oldItem = this.item;
			this.item = item;
			this.trigger("change", oldItem, this.item);
		}
	}
}