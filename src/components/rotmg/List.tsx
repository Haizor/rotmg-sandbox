import React, { CSSProperties } from "react"
import styles from "./List.module.css"

type ItemClickHandler<T> = (obj: T) => void;
type ItemFilter<T> = (obj: T, index: number) => boolean;
type ItemMapper<T> = (obj: T, index: number) => React.ReactNode

type Props<T> = {
	onElementClick?: ItemClickHandler<T>;

	elements: any[]
	columnCount?: number,
	itemsPerPage?: number,
	filter?: ItemFilter<T>,
	mapper?: ItemMapper<T>,
}

type State = {
	page: number
}

export default class List<T> extends React.Component<Props<T>, State> {
	constructor(props: Props<T>) {
		super(props);
		this.state = {page: 0}
	}

	pageBack = () => {
		this.setState({page: Math.max(this.state.page - 1, 0)})
	}

	pageForward = () => {
		this.setState({page: this.state.page + 1})
	}

	getStyle() {
		const style: CSSProperties = {};
		style.display = "grid";
		style.gridTemplateColumns = "auto ".repeat(this.props.columnCount ?? 4);
		return style;
	}

	render() {
		const itemsPerPage = this.props.itemsPerPage ?? 20;

		const startIndex = ((this.state.page ?? 1) * itemsPerPage);
		const endIndex = startIndex + itemsPerPage;

		let index = 0;
		const filter = (item: T, itemIndex: number) => {
			if (this.props.filter?.(item, itemIndex) ?? true) {
				index++;
				return index > startIndex && index <= endIndex;
			}
			return false;
		}

		const mapper: ItemMapper<T> = (obj: T, index: number) => {
			return (
				<div className="listItem" key={index} onClick={() => this.props.onElementClick?.(obj)}>
					{this.props.mapper?.(obj, index)}
				</div>
			)
		}

		const nodes = this.props.elements.filter(filter).map(mapper)
		if (nodes.length === 0) {
			this.setState({page: 0})
		}
		
		const hasNext = nodes.length === itemsPerPage;
		const hasPrev = this.state.page !== 0;

		return (
			<div>
				<div className={styles.list} style={this.getStyle()}>
					{nodes}
				</div>
				<div className={styles.pagination}>
					<div onClick={this.pageBack} className={!hasPrev ? styles.disabledPagination : "" + " " + styles.paginationButton}>{"<"}</div>
					<div>{this.state.page + 1}</div>
					<div onClick={this.pageForward} className={!hasNext ? styles.disabledPagination : "" + " " + styles.paginationButton}>{">"}</div>
				</div>
			</div>
		)
	}
}