import React, { CSSProperties } from "react";
import Equipment from "../../common/asset/rotmg/data/Equipment";
import SpriteComponent from "./Sprite";
import "./EquipSlot.css";
import Item from "../../common/asset/rotmg/data/Item";
import { Slot } from "../../common/Inventory";
import ReactDOM from "react-dom";
import { EventResult } from "../../common/EventEmitter";
import Tooltip from "./tooltip/Tooltip";
import ContextMenuProvider from "components/ContextMenuProvider";

type DropListener = (slot: Slot) => void;

type Props = {
	defaultEquip?: Equipment;
	slot: Slot;
	onDropped?: DropListener; 
}

type State = {
	equip?: Item;
	dragging: boolean;
	hovering: boolean;
	x?: number;
	y?: number;
}

const equipSlots: Map<number, EquipSlot> = new Map();
let slotCounter = 0;

export default class EquipSlot extends React.Component<Props, State> {
	index: number = 0;
	selector: React.RefObject<HTMLDivElement>;
	color: number;

	constructor(props: Props) {
		super(props);
		this.props.slot.setItem(props.defaultEquip?.createInstance())
		this.state = { equip: props.defaultEquip?.createInstance(), dragging: false, hovering: false }
		this.selector = React.createRef();
		this.color = Math.floor(Math.random() * 0xFFFFFF);
	}

	componentDidMount() {
		this.index = slotCounter++;
		equipSlots.set(this.index, this);
		this.props.slot.on("change", this.onSlotChange)
	}

	componentWillUnmount() {
		this.props.slot.remove("change", this.onSlotChange)

		equipSlots.delete(this.index);
	}

	onSlotChange = (args: any[]) => {
		const newItem = args[1];
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
		if (ev.button === 1) {
			console.log("On right click")
		}

		if (ev.button !== 0)  {
			return;
		} else if (ev.shiftKey) {
			this.props.slot.onUse();
			return;
		}

		this.setState({dragging: true, x: ev.clientX, y: ev.clientY})
	}

	onMouseMove = (ev: MouseEvent) => {
		this.setState({x: ev.clientX, y: ev.clientY})
	}

	onMouseUp = (ev: MouseEvent) => {
		let droppedOut = true;
		this.setState({dragging: false, hovering: false});
		for (const slot of equipSlots.values()) {
			const boundingBox = slot.selector.current?.getBoundingClientRect();
			if (this.state.x === undefined || this.state.y === undefined || boundingBox === undefined) {
				return;
			}

			if (this.state.x > boundingBox.left && this.state.x < boundingBox.right && this.state.y > boundingBox.top && this.state.y < boundingBox.bottom) {
				droppedOut = false;
				if (!this.props.slot.canFit(slot.state.equip) || !slot.props.slot.canFit(this.state.equip)) {
					continue;
				}
				const slotEquip = slot.state.equip;
				slot.props.slot.setItem(this.props.slot.getItem());
				this.props.slot.setItem(slotEquip);
				return;
			}
		}
		if (droppedOut) this.props.onDropped?.(this.props.slot)
	}

	getTooltip() {
		if (this.state.dragging || !this.state.hovering || !this.props.slot.hasItem()) return undefined;

		return ReactDOM.createPortal((
			<Tooltip item={this.props.slot.getItem() as Item} x={this.state.x} y={this.state.y}/>
		), document.getElementById("hoverPortal") as Element)
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
	
	onMouseEnter = (e: React.MouseEvent) => {
		this.setState({hovering: true, x: e.pageX, y: e.pageY})
	}

	onMouseLeave = () => {
		this.setState({hovering: false})
	}

	render() {
		const equip = (this.state.equip !== undefined) && (
			<div className="slotIcon" style={this.getIconStyle()}>
				<SpriteComponent texture={this.state.equip.data.texture} />
			</div>
		)


		return (
			<ContextMenuProvider options={[
				{
					name: "Test",
					onClick: () => console.log("FG")
				}
			]}>
				<div 
					ref={this.selector} 
					className="slotContainer" 
					style={{backgroundColor: "#" + this.color.toString(16)}} 
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
					onMouseDown={(ev) => this.onMouseDown(ev)}>
					{this.state.dragging ? ReactDOM.createPortal(equip, document.getElementById("hoverPortal") as Element) : equip}
				</div>
				{this.getTooltip()}
			</ContextMenuProvider>

		)
	}
}