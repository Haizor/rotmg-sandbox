import Equipment from "common/asset/rotmg/data/Equipment";
import React from "react";
import { cloneDeep } from "lodash"
import { assetManager, db } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import styles from "./EditEquipmentMenu.module.css"
import Projectile from "common/asset/rotmg/data/Projectile";
import SpritePicker from "./SpritePicker";
import { BasicTexture } from "common/asset/rotmg/data/Texture";
import PopupManager from "PopupManager";
import { Sprite } from "common/asset/rotmg/atlas/NewSpritesheet";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";

type Props = {
	equip: Equipment
	createFromExisting: boolean;
	onSave?: (equip: Equipment) => void
}

type State = {
	equip: Equipment,
	bundleName: string
}

export default class EditEquipmentMenu extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let equip = props.equip;

		if (props.createFromExisting) equip = cloneDeep(equip);

		this.state = {equip, bundleName: "test"};
	}

	render() {
		return <div className={styles.editEquipmentMenu}>

		</div>
	}
}