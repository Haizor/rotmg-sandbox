import Equipment from "common/asset/rotmg/data/Equipment";
import React from "react";
import { cloneDeep } from "lodash"
import { assetManager } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import styles from "./EditEquipmentMenu.module.css"

type Props = {
	equip: Equipment
}

type State = {
	equip: Equipment,
	bundleName: string
}

export default class EditEquipmentMenu extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let equip = props.equip;
		if (equip.readOnly) {
			equip = cloneDeep(equip);
			equip.readOnly = false;
		}
		this.state = {equip, bundleName: "test"};
	}

	getNumberInput(value: keyof Equipment ) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(this.state.equip[value] as number) = parseFloat(ev.target.value);
			this.forceUpdate();
		}
		return (
			<input type="number" value={this.state.equip[value] as number} onChange={onChange}></input>
		)
	}

	getStringInput(value: keyof Equipment) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(this.state.equip[value] as string) = ev.target.value;
			this.forceUpdate();
		}
		return (
			<input type="text" value={this.state.equip[value] as string} onChange={onChange}></input>
		)
	}

	save = () => {
		const bundle = new AssetBundle(this.state.bundleName);
		const container = new RotMGAssets();
		container.add(this.state.equip);
		bundle.containers.set("rotmg", container);
		assetManager.addBundle(bundle);
	}

	render() {
		return <div className={styles.editEquipmentMenu}>
			{this.getNumberInput("rateOfFire")}
			{this.getStringInput("displayId")}
			<button onClick={this.save}>Save</button>
		</div>
	}
}