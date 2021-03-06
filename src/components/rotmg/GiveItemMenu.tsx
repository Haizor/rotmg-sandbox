import { playerManager } from "Assets";
import React from "react";
import List from "./List";
import SpriteComponent from "./Sprite";
import styles from "./GiveItemMenu.module.css"
import TooltipProvider from "./tooltip/TooltipProvider";
import { AssetManager, XMLObject, Equipment } from "@haizor/rotmg-utils";

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

	onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({filter: e.currentTarget.value});
	}

	render() {
		const elements = this.props.assetManager.getAll<XMLObject>("equipment");

		return (
			<div className={styles.giveItemMenu}>
				<div className={styles.searchBox}>
					<div className={styles.searchTitle}>Search</div>
					<input className={styles.giveItemSearch} onChange={this.onSearch}></input>
				</div>
				<div className={styles.list}>
					<List
						elements={elements}
						itemsPerPage={20}
						filter={this.filter}
						mapper={this.mapper}
						onElementClick={this.onClick}
					/>
				</div>
			</div>

		)
	}
}