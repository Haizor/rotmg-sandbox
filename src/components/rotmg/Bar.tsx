import { EventEmitter, EventResult } from "common/EventEmitter";
import React, { CSSProperties } from "react";
import "./Bar.css"

interface ValueProvider {
	eventName: string,
	provider: EventEmitter
}

type Props = {
	valueProvider: ValueProvider,
	color?: string;
}

type State = {
	value: number;
	maxValue: number;
}

export default class Bar extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			value: -1,
			maxValue: -1
		}
	}

	componentDidMount() {
		this.props.valueProvider.provider.on(this.props.valueProvider.eventName, this.updateBar)
	}

	componentWillUnmount() {

	}

	updateBar = ([value, maxValue]: [number, number]) => {
		this.setState({value, maxValue})
		return EventResult.Pass;
	}

	getBarStyle() {
		const style: CSSProperties = {};
		style.width = `${Math.floor((this.state.value / this.state.maxValue) * 100)}%`
		if (this.props.color !== undefined) {
			style.backgroundColor = this.props.color;
		}
		return style;
	}

	render() {
		return (
			<div className="barBack">
				<div className="bar" style={this.getBarStyle()}>

				</div>
				<div className="barText">
					{Math.floor(this.state.value)}/{Math.floor(this.state.maxValue)}
				</div>
			</div>
		)
	}
}