import React from "react";
import ReactDOM from "react-dom";
import styles from "./ContextMenuProvider.module.css";

export type ContextMenuOption = {
	name: string,
	onClick: () => void
}

type Props = {
	
	options: ContextMenuOption[]
}

type State = {
	contextMenuOpened: boolean;
	x: number;
	y: number;
}

export default class ContextMenuProvider extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { contextMenuOpened: false, x: 0, y: 0 }
	}

	onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		window.addEventListener("click", this.close)
		// window.addEventListener("contextmenu", this.close)
		this.setState({contextMenuOpened: true, x: e.pageX, y: e.pageY})
	}

	close = () => {
		window.removeEventListener("click", this.close)
		// window.addEventListener("contextmenu", this.close)
		this.setState({contextMenuOpened: false});
	}

	componentWillUnmount() {
		this.close();
	}

	renderContextMenu() {
		if (!this.state.contextMenuOpened || this.props.options.length === 0) return undefined;
		return ReactDOM.createPortal(<div className={styles.contextMenu} style={{left: `${this.state.x}px`, top: `${this.state.y}px`}}>
			{this.props.options.map((option) => 
				<div key={option.name} className={styles.contextMenuItem} onClick={() => {option.onClick(); this.setState({contextMenuOpened: false})}}>
					{option.name}
				</div>
			)}
		</div>, document.getElementById("hoverPortal") as Element)
	}

	render() {
		return <div className={styles.contextMenuContainer} onContextMenu={this.onContextMenu}>
			{this.props.children}
			{this.renderContextMenu()}
		</div>
	}
}