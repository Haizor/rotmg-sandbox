import { playerManager } from "Assets";
import AssetManager from "common/asset/normal/AssetManager";
import Equipment from "common/asset/rotmg/data/Equipment";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import React from "react";
import List from "./List";
import SpriteComponent from "./Sprite";
import "./GiveItemMenu.css"

type Props = {
	assetManager: AssetManager;
}

type State = {
	page: number,
	filter: string
}

export default class GiveItemMenu extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { page: 0, filter: "" }
	}

	filter = (obj: XMLObject) => {
		if (obj instanceof Equipment && obj.getDisplayName().toLowerCase().includes(this.state.filter.toLowerCase())) {
			return true;
		}
		return false;
	}

	mapper = (obj: XMLObject) => {
		return (
			<SpriteComponent texture={obj.texture} />
		)
	}

	onClick = (obj: XMLObject) => {
		console.log("CLICK")
		
		playerManager.inventory.addItem((obj as Equipment).createInstance());
	}

	render() {
		const elements = this.props.assetManager.getAll<XMLObject>("rotmg");

		return (
			<div className="giveItemMenu">
				<input className="giveItemSearch" onChange={(e) => this.setState({filter: e.currentTarget.value})}></input>
				<List
					page={this.state.page}
					elements={elements}
					itemsPerPage={20}
					filter={this.filter}
					mapper={this.mapper}
					onElementClick={this.onClick}
				/>
			</div>

		)
	}
}