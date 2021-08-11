import React, { CSSProperties } from "react"

type ItemClickHandler<T> = (obj: T) => void;
type ItemFilter<T> = (obj: T, index: number) => boolean;
type ItemMapper<T> = (obj: T, index: number) => React.ReactNode

type Props<T> = {
	onElementClick?: ItemClickHandler<T>;

	elements: any[]
	columnCount?: number,
	page?: number,
	itemsPerPage?: number,
	filter?: ItemFilter<T>,
	mapper?: ItemMapper<T>,
}

export default class List<T> extends React.Component<Props<T>, any> {
	getStyle() {
		const style: CSSProperties = {};
		style.display = "grid";
		style.gridTemplateColumns = "auto ".repeat(this.props.columnCount ?? 4);
		return style;
	}

	render() {
		const itemsPerPage = this.props.itemsPerPage ?? 20;

		const startIndex = ((this.props.page ?? 1) * itemsPerPage);
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

		return (
			<div className="itemList" style={this.getStyle()}>
				{nodes}
			</div>
		)
	}
}