import React from "react";
import { assetManager, playerManager } from "../Assets";
import RotMGGame from "../game/rotmg/RotMGGame";

export default class Canvas extends React.Component {
	canvas: React.RefObject<HTMLCanvasElement>;
	game: RotMGGame | undefined;
	
	constructor(props: any) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount() {
		window.addEventListener("resize", this.onResize)
		if (this.canvas.current !== null) {
			this.game = new RotMGGame(this.canvas.current, assetManager, playerManager);
			this.onResize();
		}
	}

	componentWillUnmount() {
		document.body.removeEventListener("resize", this.onResize);
	}

	onResize = () => {
		if (this.canvas.current !== null) {
			const rect = document.body.getBoundingClientRect();
			this.canvas.current.width = rect.width - 12;
			this.canvas.current.height = rect.height - 12;
		}
	}

	componentDidUpdate() {
		if (this.game !== undefined && this.canvas.current !== null) {
			this.game.canvas = this.canvas.current;
		}
	}

	render() {
		return (
			<div>
				<canvas width="800" height="600" ref={this.canvas} style={{border: "2px solid red"}}></canvas>
				<div id="test"></div>
			</div>
		)
	}
}