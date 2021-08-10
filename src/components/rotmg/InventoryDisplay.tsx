import React, { CSSProperties } from "react";
import Inventory, { Slot } from "../../common/Inventory";
import EquipSlot from "./EquipSlot";
import "./InventoryDisplay.css";

type State = {

}

type Props = {
	inventory: Inventory;
	slotsPerRow: number;
	displayCount: number;
}

export default class InventoryDisplay extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	getStyle() {
		const style: CSSProperties = {};
		style.display = "grid";
		style.gridTemplateColumns = "auto auto auto auto";
		return style;
	}

	onDropped = (slot: Slot) => {
		slot.setItem(undefined);
	} 

	render() {
		const slots = this.props.inventory.slots.map((slot, index) => <EquipSlot key={index} slot={slot} onDropped={this.onDropped}></EquipSlot>);
		return (
			<div className="inventory" style={this.getStyle()}>
				{slots}
			</div>
		)
	}
}