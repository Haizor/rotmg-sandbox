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
		return (
			<div>
				<canvas width="800" height="800" ref={this.canvas} style={{border: "2px solid red"}}></canvas>
				<div id="test"></div>
			</div>
		)
	}
}