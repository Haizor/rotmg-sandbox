import { EventEmitter, EventResult } from "common/EventEmitter";
import React, { CSSProperties } from "react";
import styles from "./Bar.module.css"

interface ValueProvider {
	eventName: string,
	provider: EventEmitter
}

type Props = {
	valueProvider: ValueProvider,
	borderColorProvider?: ValueProvider,
	color?: string;
}

type State = {
	value: number;
	maxValue: number;
	borderColor?: string
}

export default class Bar extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			value: -1,
			maxValue: -1,
		}
	}

	componentDidMount() {
		const value = this.props.valueProvider;
		value.provider.on(value.eventName, this.updateBar);

		if (this.props.borderColorProvider !== undefined) {
			const value = this.props.borderColorProvider;
			value.provider.on(value.eventName, this.updateBorderColor);
		}
	}

	componentWillUnmount() {
		const value = this.props.valueProvider;
		value.provider.remove(value.eventName, this.updateBar)

		if (this.props.borderColorProvider !== undefined) {
			const value = this.props.borderColorProvider;
			value.provider.remove(value.eventName, this.updateBorderColor);
		}
	}

	updateBar = ([value, maxValue]: [number, number]) => {
		this.setState({value, maxValue})
		return EventResult.Pass;
	}

	updateBorderColor = ([color] : [string]) => {
		this.setState({borderColor: color});
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


	getBarBackStyle() {
		const style: CSSProperties = {};
		if (this.state.borderColor !== undefined) {
			style.borderColor = this.state.borderColor;
		}
		return style;
	}

	render() {
		return (
			<div className={styles.barBack} style={this.getBarBackStyle()}>
				<div className={styles.bar} style={this.getBarStyle()}>

				</div>
				<div className={styles.barText}>
					{Math.floor(this.state.value)}/{Math.floor(this.state.maxValue)}
				</div>
			</div>
		)
	}
}