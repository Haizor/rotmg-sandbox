import React, { CSSProperties } from "react";
import SpriteComponent from "./Sprite";
import { Slot } from "../../common/Inventory";
import ReactDOM from "react-dom";
import { EventResult } from "../../common/EventEmitter";
import ContextMenuProvider from "components/ContextMenuProvider";
import PopupManager from "PopupManager";
import EditEquipmentMenu from "./EditEquipmentMenu";
import { cloneDeep } from "lodash";

import styles from "./EquipSlot.module.css";
import TooltipProvider from "./tooltip/TooltipProvider";
import { Equipment, Item } from "rotmg-utils";

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

	constructor(props: Props) {
		super(props);
		this.props.slot.setItem(props.defaultEquip?.createInstance())
		this.state = { equip: props.defaultEquip?.createInstance(), dragging: false, hovering: false }
		this.selector = React.createRef();
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
		this.forceUpdate()
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

	shouldRenderTooltip() {
		return (!this.state.dragging && this.props.slot.hasItem())
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

	getContextOptions() {
		if (this.state.equip === undefined) return [];

		const options = [
			{
				name: "Copy",
				onClick: () => {
					if (this.state.equip === undefined) return;

					const equip = cloneDeep(this.state.equip.data);
					equip.readOnly = false;
					PopupManager.popup("itemEditor+" + equip.id, <EditEquipmentMenu equip={equip} createFromExisting={true} onSave={(equip) => this.props.slot.setItem(equip.createInstance())}/>)
				}
			}
		];

		if (!this.state.equip?.data.readOnly) {
			options.push({
				name: "Edit",
				onClick: () => PopupManager.popup("itemEditor+" + this.state.equip?.data.id, <EditEquipmentMenu equip={this.state.equip?.data as Equipment} createFromExisting={false}/>)
			})
		}

		return options;
	}

	render() {
		const equip = (this.state.equip !== undefined) && (
			<div className={styles.slotIcon} style={this.getIconStyle()}>
				<SpriteComponent texture={this.state.equip.data.texture} />
			</div>
		)

		const inner = <div 
			ref={this.selector} 
			className={styles.slotContainer}
			onMouseEnter={this.onMouseEnter}
			onMouseLeave={this.onMouseLeave}
			onMouseDown={(ev) => this.onMouseDown(ev)}>
			{this.state.dragging ? ReactDOM.createPortal(equip, document.getElementById("hoverPortal") as Element) : equip}
		</div>

		if (this.shouldRenderTooltip()) {
			return <ContextMenuProvider options={this.getContextOptions()}>
				<TooltipProvider item={this.props.slot.getItem() as Item}>
					{inner}
				</TooltipProvider>
			</ContextMenuProvider>
		}

		return (
			<ContextMenuProvider options={this.getContextOptions()}>
				{inner}
			</ContextMenuProvider>
		)
	}
}