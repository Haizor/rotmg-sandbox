import React from "react";
import { Sprite, AssetManager } from "@haizor/rotmg-utils";
import List from "./List";
import SpriteComponent from "./Sprite";
import styles from "./SpritePicker.module.css";

type Props = {
	onPicked?: (sprite: Sprite) => void
	assetManager: AssetManager
}

type State = {
	filter: string;
}

export default class SpritePicker extends React.Component<Props, State> {
	sprites: Sprite[]
	constructor(props: Props) {
		super(props);
		this.sprites = props.assetManager.getAll("sprites");
		this.state = { filter: "" }
	}

	mapper = (sprite: Sprite) => {
		return <SpriteComponent sprite={sprite} />
	}

	filter = (sprite: Sprite) => {
		return true;
		// return sprite.spriteSheetName.indexOf(this.state.filter) !== -1;
	}

	onElementClick = (sprite: Sprite) => {
		if (this.props.onPicked !== undefined) this.props.onPicked(sprite);
	}



	render() {
		return (
			<div className={styles.spritePicker}>
				<input type="text" onChange={(e) => this.setState({filter: e.currentTarget.value})}/>
				<List
					elements={this.sprites}
					mapper={this.mapper}
					filter={this.filter}
					onElementClick={this.onElementClick}
				>

				</List>
			</div>
		)
	}
}