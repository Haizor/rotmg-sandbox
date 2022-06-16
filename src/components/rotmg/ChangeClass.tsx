import PlayerManager from "common/PlayerManager";
import React from "react";
import { AssetManager, XMLObject, Player } from "@haizor/rotmg-utils";
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