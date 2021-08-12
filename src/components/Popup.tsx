import React, { CSSProperties } from "react"
import ReactDOM from "react-dom";
import styles from "./Popup.module.css";

type Props = {
	title?: string,
	onClose: () => void
}

type State = {
	visible: boolean,
	dragging: boolean;
	offsetX: number,
	offsetY: number
	x?: number,
	y?: number
}

export default class Popup extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { visible: true, dragging: false, x: 0, y: 0, offsetX: 0, offsetY: 0 }
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
		if (this.state.dragging && !prevState.dragging) {
			document.addEventListener("mousemove", this.onMouseMove);
			document.addEventListener("mouseup", this.onMouseUp);
		} else if (!this.state.dragging && prevState.dragging) {
			document.removeEventListener("mousemove", this.onMouseMove);
			document.removeEventListener("mouseup", this.onMouseUp);
		}
	}

	getPopupStyle() {
		const style: CSSProperties = {};
		style.left = this.state.x;
		style.top = this.state.y;
		return style;
	}

	onMouseDown = (ev: React.MouseEvent) => {
		const element = ev.currentTarget.getBoundingClientRect();
		const offsetX = element.left - ev.pageX;
		const offsetY = element.top - ev.pageY;
		const x = ev.pageX + offsetX;
		const y = ev.pageY + offsetY;

		this.setState({dragging: true, x, y, offsetX, offsetY});
	}

	onMouseMove = (ev: MouseEvent) => {
		const x = ev.pageX + this.state.offsetX;
		const y = ev.pageY + this.state.offsetY;
		this.setState({x, y});
	}

	onMouseUp = (ev: MouseEvent) => {
		this.setState({dragging: false})
	}

	toggleVisible = (ev: React.MouseEvent) => {
		ev.preventDefault()

		this.props.onClose();
	}

	render() {
		const popup = (this.state.visible ? 
			<div className={styles.popupContainer} style={this.getPopupStyle()}>
				<div className={styles.popupHandle} onMouseDown={this.onMouseDown}>
					{this.props.title}
					<div className={styles.popupClose} onMouseDown={this.toggleVisible}>
						X
					</div>
				</div>
				{this.props.children}
			</div>
		: null);
	
		return popup
	}
}