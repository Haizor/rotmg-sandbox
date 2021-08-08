import React, { CSSProperties } from "react";
import Equipment, { SlotType } from "../../game/rotmg/data/Equipment";
import SpriteComponent from "./Sprite";
import "./EquipSlot.css";

type Props = {
	defaultEquip?: Equipment;
	slotType?: SlotType;
}

type State = {
	equip?: Equipment;
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
	constructor(props: Props) {
		super(props);

		this.state = { equip: props.defaultEquip, dragging: false }
		this.selector = React.createRef();
		this.color = Math.floor(Math.random() * 0xFFFFFF);
	}

	componentDidMount() {
		this.index = slotCounter++;
		equipSlots.set(this.index, this);
	}

	componentWillUnmount() {
		equipSlots.delete(this.index);
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
		if (ev.button !== 0) return;

		this.setState({dragging: true, x: ev.clientX, y: ev.clientY})
	}

	onMouseMove = (ev: MouseEvent) => {
		this.setState({x: ev.clientX, y: ev.clientY})
	}

	onMouseUp = (ev: MouseEvent) => {
		this.setState({dragging: false});
		for (const slot of equipSlots.values()) {
			const boundingBox = slot.selector.current?.getBoundingClientRect();
			if (!this.canFit(slot.state.equip) || !slot.canFit(this.state.equip)) {
				continue;
			}
			if (this.state.x === undefined || this.state.y === undefined || boundingBox === undefined) {
				return;
			}
			if (this.state.x > boundingBox.left && this.state.x < boundingBox.right && this.state.y > boundingBox.top && this.state.y < boundingBox.bottom) {
				const slotEquip = slot.state.equip;
				slot.setState({equip: this.state.equip});
				this.setState({equip: slotEquip});
			}
		}
	}

	canFit(equip: Equipment | undefined) {
		if (equip === undefined || this.props.slotType === undefined) return true;

		return equip.slotType === this.props.slotType;
	}

	getIconStyle() {
		const style: CSSProperties = {};
		if (this.state.dragging && this.state.x && this.state.y) {
			style.position = "absolute";
			style.top = `${this.state.y - 32}px`;
			style.left = `${this.state.x - 32}px`;
		}
		return style;
	}

	render() {
		const equip = (this.state.equip !== undefined) && (
			<div className="slotIcon" style={this.getIconStyle()}>
				<SpriteComponent texture={this.state.equip.texture} />
			</div>
		)
		return (
			<div ref={this.selector} className="slotContainer" style={{backgroundColor: "#" + this.color.toString(16)}} onMouseDown={(ev) => this.onMouseDown(ev)}>
				{equip}
			</div>
		)
	}
}