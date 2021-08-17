import AssetManager from "common/asset/normal/AssetManager";
import Player from "common/asset/rotmg/data/Player";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import PlayerManager from "common/PlayerManager";
import React from "react";
import List from "./List";
import SpriteComponent from "./Sprite";

type Props = {
	playerManager: PlayerManager,
	assetManager: AssetManager
}

export default class ChangeClass extends React.Component<Props> {
	filter = (obj: XMLObject) => obj instanceof Player

	mapper = (obj: XMLObject) => {
		return <SpriteComponent texture={obj.texture} />
	}

	changeClass = (ply: Player) => {
		this.props.playerManager.setClass(ply);
	}

	render() {
		const objects = this.props.assetManager.getAll("rotmg");

		return <List elements={objects} filter={this.filter} mapper={this.mapper} onElementClick={this.changeClass}/>
	}
}