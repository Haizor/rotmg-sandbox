import React, { CSSProperties } from "react";
import Equipment, { SlotType } from "../../common/asset/rotmg/data/Equipment";
import SpriteComponent from "./Sprite";
import "./EquipSlot.css";
import Item from "../../common/asset/rotmg/data/Item";
import { Slot } from "../../common/Inventory";
import ReactDOM from "react-dom";
import { EventResult } from "../../common/EventEmitter";

type Props = {
	defaultEquip?: Equipment;
	slot: Slot;
}

type State = {
	equip?: Item;
	dragging: boolean;
	x?: number;
	y?: number;
}

const equipSlots: Map<number, EquipSlot> = new Map();
let slotCounter = 0;

export default class EquipSlot extends React.Component<Props, State> {
	index: number = 0;
	selector: React.RefObject<HTMLDivElement>;
	color: number;
	slot: Slot;
	constructor(props: Props) {
		super(props);
		this.slot = props.slot;
		this.slot.setItem(props.defaultEquip?.createInstance())
		this.state = { equip: props.defaultEquip?.createInstance(), dragging: false }
		this.selector = React.createRef();
		this.color = Math.floor(Math.random() * 0xFFFFFF);
	}

	componentDidMount() {
		this.index = slotCounter++;
		equipSlots.set(this.index, this);
		this.slot.on("change", this.onSlotChange)
	}

	componentWillUnmount() {
		this.slot.remove("change", this.onSlotChange)

		equipSlots.delete(this.index);
	}

	onSlotChange = (args: any[]) => {
		const [oldItem, newItem] = args;
		this.setState({equip: newItem});
		return EventResult.Success;
	}

	componentDidUpdate(props: Props, state: State) {
		if (this.state.dragging && !state.dragging) {
			document.addEventListener("mousemove", this.onMouseMove);
			document.addEventListener("mouseup", this.onMouseUp)
		} else if (!this.state.dragging && state.dragging) {
			document.removeEventListener("mousemove", this.onMouseMove);
			document.removeEventListener("mouseup", this.onMouseUp);
		}
	}

	onMouseDown(ev: React.MouseEvent) {
		if (ev.button !== 0)  {
			return;
		} else if (ev.shiftKey) {
			this.slot.onUse();
			return;
		}

		this.setState({dragging: true, x: ev.clientX, y: ev.clientY})
	}

	onMouseMove = (ev: MouseEvent) => {
		this.setState({x: ev.clientX, y: ev.clientY})
	}

	onMouseUp = (ev: MouseEvent) => {
		this.setState({dragging: false});
		for (const slot of equipSlots.values()) {
			const boundingBox = slot.selector.current?.getBoundingClientRect();
			if (!this.slot.canFit(slot.state.equip) || !slot.slot.canFit(this.state.equip)) {
				continue;
			}
			if (this.state.x === undefined || this.state.y === undefined || boundingBox === undefined) {
				return;
			}
			if (this.state.x > boundingBox.left && this.state.x < boundingBox.right && this.state.y > boundingBox.top && this.state.y < boundingBox.bottom) {
				const slotEquip = slot.state.equip;
				slot.slot.setItem(this.slot.getItem());
				this.slot.setItem(slotEquip);
			}
		}
	}

	getIconStyle() {
		const style: CSSProperties = {};
		if (this.state.dragging && this.state.x && this.state.y) {
			style.position = "absolute";
			style.top = `${this.state.y - 32}px`;
			style.left = `${this.state.x - 32}px`;
			style.zIndex = 1000;
		}
		return style;
	}

	render() {
		const equip = (this.state.equip !== undefined) && (
			<div className="slotIcon" style={this.getIconStyle()}>
				<SpriteComponent texture={this.state.equip.data.texture} />
			</div>
		)

		return (
			<div ref={this.selector} className="slotContainer" style={{backgroundColor: "#" + this.color.toString(16)}} onMouseDown={(ev) => this.onMouseDown(ev)}>
				{this.state.dragging ? ReactDOM.createPortal(equip, document.getElementById("hoverPortal") as Element) : equip}
			</div>
		)
	}
}