import AssetBundle from "common/asset/normal/AssetBundle";
import { AssetContainer } from "common/asset/normal/AssetContainer";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
import { Sprite } from "common/asset/rotmg/atlas/NewSpritesheet";
import SpriteComponent from "components/rotmg/Sprite";
import React, { CSSProperties } from "react";
import styles from "./SpritesheetEditor.module.css";

type SelectedSprite = {
	index: number,
	sprite: Sprite
}

type Props = {
	bundle: AssetBundle,
	container: AssetContainer<any>
}

type State = {
	zoom: number;
	x: number;
	y: number;
	dragging: boolean;
	canMove: boolean;
	selectedSprite?: SelectedSprite
}

export default class SpritesheetEditor extends React.Component<Props, State> {
	parent: React.RefObject<HTMLDivElement>;
	container: React.RefObject<HTMLDivElement>;
	constructor(props: Props) {
		super(props);
		this.parent = React.createRef();
		this.container = React.createRef();
		this.state = { zoom: 1, x: 0, y: 0, dragging: false, canMove: false }
	}

	componentDidMount() {
		if (this.parent !== null && this.props.container instanceof CustomSpritesheet) {
			this.parent.current?.appendChild(this.props.container.ctx.canvas)
		}
		window.addEventListener("mousemove", this.onMouseMove)
	}

	componentWillUnmount() {

	}

	onScroll = (e: React.WheelEvent) => {
		const zoom = this.state.zoom + (e.deltaY / -100);
		if (zoom > 0 && this.container.current !== null) {
			const ratio = 1 - zoom / this.state.zoom;
			const rect = this.container.current.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const x = this.state.x + (mouseX - this.state.x) * ratio;
			const y = this.state.y + (mouseY - this.state.y) * ratio;
			this.setState({zoom, x, y})
		}
	}

	onMouseDown = (e: React.MouseEvent) => {
		this.props.bundle.dirty = true;
		this.setState({dragging: true})
	}

	onMouseMove = (e: MouseEvent) => {
		if (this.state.dragging) {
			if (!this.state.canMove) {
				const x = this.state.x + e.movementX;
				const y = this.state.y + e.movementY;
				this.setState({x, y})
			} else if (this.state.selectedSprite !== undefined) {
				const { sprite, index } = this.state.selectedSprite;
				sprite.getData().position.x += e.movementX / this.state.zoom;
				sprite.getData().position.y += e.movementY / this.state.zoom;
				this.update();
			}
		} 
	}

	onMouseUp = (e: React.MouseEvent) => {
		this.setState({dragging: false})
	}

	getCanvasStyle(): CSSProperties {
		return {
			transformOrigin: `0 0`,
			transform: `
				translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.zoom}) 
			`,

		}
	}

	update() {
		
		this.forceUpdate();
	}

	uploadImage = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = false;
		input.click();

		input.onchange = async () => {
			if (input.files !== null && input.files[0] !== undefined) {
				const file = input.files[0];
				const img = new Image();
				img.src = URL.createObjectURL(file)
				img.addEventListener("load", () => {
					if (this.props.container instanceof CustomSpritesheet) {
						this.props.container.ctx.drawImage(img, 0, 0);
						this.props.container.updateBlob();
						this.props.container.updateTexture();
						this.update();
					}
				});
			}
			input.remove()
		}

	}

	getSprites(): React.ReactNodeArray {
		if (this.props.container instanceof CustomSpritesheet) {
			const sheet = this.props.container as CustomSpritesheet;
			return sheet.getAll().map((sprite, index) => {
				const { position } = sprite.getData();
				const style: CSSProperties = {
					position: "absolute",
					left: `${position.x}px`,
					top: `${position.y}px`,
					width: `${position.w - 2}px`,
					height: `${position.h - 2}px`
				}
				const onClick = () => {
					this.setState({selectedSprite: {sprite, index}})
				}
				const selected = this.state.selectedSprite !== undefined && this.state.selectedSprite.sprite === sprite;
				const className = styles.sprite + (selected ? ` ${styles.selected}` : "");
				return <div key={index} className={className} style={style} onClick={onClick}>
					
				</div>
			})
		}

		return [];
	}
	
	getSpriteInfo(): React.ReactNode {
		if (this.state.selectedSprite === undefined) return null;
		const { sprite, index } = this.state.selectedSprite;
		const data = sprite.getData();

		const deleteSprite = () => {
			(this.props.container as CustomSpritesheet).delete(index);
			this.setState({selectedSprite: undefined})
		}

		return <div className={styles.info}>
			<SpriteComponent sprite={sprite}></SpriteComponent>
			<div>ID: {data.spriteSheetName}:{data.index}</div>
			<div>Can Move: <input type="checkbox" checked={this.state.canMove} onChange={(e) => this.setState({canMove: e.currentTarget.checked})} /></div>
			<button onClick={deleteSprite}>Delete</button>
		</div>
	}

	render() {
		return <div className={styles.topContainer}>
			<div className={styles.topBar}>
				<button onClick={this.uploadImage}>Upload Image</button>
			</div>
			<div className={styles.container}>
				<div 
					className={styles.canvasContainer} 
					ref={this.container}
					onWheel={this.onScroll} 
					onMouseDown={this.onMouseDown}
					onMouseUp={this.onMouseUp}
					tabIndex={0}
				>
					<div ref={this.parent} className={styles.canvasBack} style={this.getCanvasStyle()}>
						<div className={styles.canvasOverlay}>
							{this.getSprites()}
						</div>
					</div>
				</div>
				<div>
					{this.getSpriteInfo()}
				</div>
			</div>
		</div>
	}
}