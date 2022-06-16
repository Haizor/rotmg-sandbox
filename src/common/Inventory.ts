import { Item, SlotType } from "@haizor/rotmg-utils";
import { EventEmitter } from "./EventEmitter";

type PossibleItem = Item | undefined;

export default class Inventory extends EventEmitter {
	slots: Slot[] = [];
	size: number;
	constructor(size: number) {
		super();
		this.size = size;
		for (let i = 0; i < size; i++) {
			this.slots[i] = new Slot(this);
		}
	}

	onSlotChange(oldItem: PossibleItem, newItem: PossibleItem) {
		this.trigger("change", oldItem, newItem);
	}

	onUse(slot: Slot) {
		this.trigger("use", slot);
	}

	addItem(item: PossibleItem) {
		for (let i = 0; i < this.size; i++) {
			if (!this.slots[i].hasItem() && this.slots[i].canFit(item)) {
				this.setItem(i, item);
				return;
			}
		}
	}

	getItem(slot: number): PossibleItem {
		if (slot > this.size) {
			return;
		}
		return this.slots[slot].getItem();
	}

	setItem(slot: number, item: PossibleItem) {
		if (slot > this.size) {
			return;
		}
		const oldItem = this.slots[slot].getItem();
		if (this.slots[slot].setItem(item)) {
			this.onSlotChange(oldItem, item)
		}
	}
}

export class Slot extends EventEmitter {
	type: SlotType = SlotType.None;
	item?: Item;
	owner: Inventory
	constructor(owner: Inventory, type?: SlotType) {
		super();
		this.owner = owner;
		this.type = type || SlotType.None;
	}

	getItem(): Item | undefined {
		return this.item;
	}

	canFit(item: PossibleItem): boolean {
		if (item !== undefined && this.type !== SlotType.None && item.data.slotType !== this.type) {
			return false;
		}
		return true;
	}

	hasItem(): boolean {
		return this.item !== undefined;
	}

	onUse() {
		if (this.item !== undefined) {
			this.trigger("use", this.item);
			this.owner.onUse(this);
		}
	}

	onChange(oldItem: PossibleItem, newItem: PossibleItem) {
		this.owner.onSlotChange(oldItem, newItem);
		this.trigger("change", oldItem, newItem)
	}

	setItem(item: PossibleItem): boolean {
		if (this.canFit(item)) {
			const oldItem = this.item;
			this.item = item;
			this.onChange(oldItem, item);
			return true;
		}
		return false;
	}
}