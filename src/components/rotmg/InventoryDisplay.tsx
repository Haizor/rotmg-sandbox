import React, { CSSProperties } from "react";
import Inventory from "../../common/Inventory";
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

	render() {
		const slots = this.props.inventory.slots.map((slot, index) => <EquipSlot key={index} slot={slot}></EquipSlot>);
		return (
			<div className="inventory" style={this.getStyle()}>
				{slots}
			</div>
		)
	}
}