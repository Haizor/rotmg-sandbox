import { EventResult } from "common/EventEmitter";
import { PopupManager } from "PopupManager";
import React from "react";
import Popup from "./Popup";

export type Props = {
	manager: PopupManager
}

export type State = {
	popups: Array<any>
}

export default class PopupRenderer extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {popups: []};
	}

	componentDidMount() {
		this.props.manager.on("update", this.onNewPopups);
	}

	componentWillUnmount() {
		this.props.manager.remove("update", this.onNewPopups);
	}

	onNewPopups = ([popups]: any) => {
		this.setState({popups});

		return EventResult.Pass;
	}

	render() {
		return (
			<div>
				{this.state.popups.map((popup) => {
					return <Popup key={popup[0]} onClose={() => this.props.manager.close(popup[0])}>
						{popup[1]}
					</Popup>
				})}
			</div>
		)
	}
}