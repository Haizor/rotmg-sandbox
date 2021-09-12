import Item from "common/asset/rotmg/data/Item";
import React from "react";
import ReactDOM from "react-dom";
import Tooltip from "./Tooltip";

type Props = {
	item: Item
}

type State = {
	x: number;
	y: number;
	hovering: boolean;
}

export default class TooltipProvider extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {hovering: false, x: 0, y: 0};
	}

	onMouseEnter = (e: React.MouseEvent) => {
		this.setState({hovering: true, x: e.clientX, y: e.clientY})
	}

	onMouseMove = (e: React.MouseEvent) => {
		this.setState({x: e.clientX, y: e.clientY})
	}

	onMouseLeave = (e: React.MouseEvent) => {
		this.setState({hovering: false, x: e.clientX, y: e.clientY})
	}

	getTooltip(): React.ReactNode {
		if (!this.state.hovering) return null;
		return ReactDOM.createPortal((
			<Tooltip item={this.props.item} x={this.state.x} y={this.state.y}/>
		), document.getElementById("hoverPortal") as Element)
	}

	render() {
		return <div onMouseEnter={this.onMouseEnter} onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave}>
			{this.props.children}
			{this.getTooltip()}
		</div>
	}
}