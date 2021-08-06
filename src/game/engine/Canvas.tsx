import React from "react";
import RotMGGame from "../rotmg/RotMGGame";

export default class Canvas extends React.Component {
	canvas: React.RefObject<HTMLCanvasElement>;
	constructor(props: any) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount() {
		if (this.canvas.current !== null) {
			new RotMGGame(this.canvas.current);
		}
	}

	render() {
		return <canvas width="800" height="600" ref={this.canvas}></canvas>
	}
}