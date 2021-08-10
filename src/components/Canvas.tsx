import React from "react";
import { assetManager, playerManager } from "../Assets";
import RotMGGame from "../game/rotmg/RotMGGame";

export default class Canvas extends React.Component {
	glCanvas: React.RefObject<HTMLCanvasElement>;
	canvas: React.RefObject<HTMLCanvasElement>;
	container: React.RefObject<HTMLDivElement>;

	game: RotMGGame | undefined;
	
	constructor(props: any) {
		super(props);
		this.glCanvas = React.createRef();
		this.canvas = React.createRef();
		this.container = React.createRef();
	}

	componentDidMount() {
		window.addEventListener("resize", this.onResize)
		if (this.glCanvas.current !== null && this.canvas.current !== null) {
			this.game = new RotMGGame(this.glCanvas.current, this.canvas.current, assetManager, playerManager);
			this.onResize();
		}
	}
	
	componentDidUpdate() {
		if (this.game !== undefined && this.glCanvas.current !== null && this.canvas.current !== null) {
			this.game.stop();
			this.game = new RotMGGame(this.glCanvas.current, this.canvas.current, assetManager, playerManager);
		}
	}

	componentWillUnmount() {
		document.body.removeEventListener("resize", this.onResize);
	}

	onResize = () => {
		if (this.glCanvas.current !== null && this.canvas.current !== null && this.container.current !== null) {
			const rect = this.container.current.getBoundingClientRect();
			this.glCanvas.current.width = rect.width - 12;
			this.glCanvas.current.height = rect.height - 12;

			this.canvas.current.width = rect.width - 12;
			this.canvas.current.height = rect.height - 12;
		}
	}

	render() {
		return (
			<div style={{position: "relative", width: "100%", height: "100%"}} ref={this.container}>
				<canvas style={{position: "absolute"}} width="800" height="600" ref={this.glCanvas}></canvas>
				<canvas style={{position: "absolute", pointerEvents: "none"}} width="800" height="600" ref={this.canvas}></canvas>
			</div>
		)
	}
}