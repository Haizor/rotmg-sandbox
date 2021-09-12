import { playerManager } from "Assets";
import AssetManager from "common/asset/normal/AssetManager";
import Equipment from "common/asset/rotmg/data/Equipment";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import React from "react";
import List from "./List";
import SpriteComponent from "./Sprite";
import styles from "./GiveItemMenu.module.css"
import TooltipProvider from "./tooltip/TooltipProvider";

type Props = {
	assetManager: AssetManager;
}

type State = {
	filter: string
}

export default class GiveItemMenu extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { filter: "" }
	}

	filter = (obj: XMLObject) => {
		try {
			if (obj instanceof Equipment && obj.getDisplayName().toLowerCase().includes(this.state.filter.toLowerCase())) {
				return true;
			}
		} catch {
			console.log(obj)
		}

		return false;
	}

	mapper = (obj: Equipment) => {
		return (
			<TooltipProvider item={obj.createInstance()}>
				<div className={styles.equip}>
					<SpriteComponent texture={obj.texture} />
				</div>
			</TooltipProvider>
		)
	}

	onClick = (obj: XMLObject) => {
		playerManager.inventory.addItem((obj as Equipment).createInstance());
	}

	render() {
		const elements = this.props.assetManager.getAll<XMLObject>("rotmg");

		return (
			<div className={styles.giveItemMenu}>
				<input className={styles.giveItemSearch} onChange={(e) => this.setState({filter: e.currentTarget.value})}></input>
				<List
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