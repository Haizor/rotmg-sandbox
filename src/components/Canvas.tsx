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
		console.log(this.glCanvas.current)
		window.addEventListener("resize", this.onResize)
		if (this.glCanvas.current !== null && this.canvas.current !== null) {
			if (this.game !== undefined) this.game.stop();
			this.game = new RotMGGame(this.glCanvas.current, this.canvas.current, assetManager, playerManager);
			this.onResize();
		}
	}

	componentDidUpdate() {
		console.log("updated")
	}
	
	componentWillUnmount() {
		document.body.removeEventListener("resize", this.onResize);
		this.game?.stop();
	}

	onResize = () => {
		if (this.glCanvas.current !== null && this.canvas.current !== null && this.container.current !== null) {
			const rect = this.container.current.getBoundingClientRect();
			this.glCanvas.current.width = rect.width;
			this.glCanvas.current.height = rect.height;

			this.canvas.current.width = rect.width;
			this.canvas.current.height = rect.height;
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