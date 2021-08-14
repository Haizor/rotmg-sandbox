import Equipment from "common/asset/rotmg/data/Equipment";
import React from "react";
import { cloneDeep } from "lodash"
import { assetManager, db } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import styles from "./EditEquipmentMenu.module.css"
import Projectile from "common/asset/rotmg/data/Projectile";
import SpritePicker from "./SpritePicker";
import { Sprite } from "common/asset/rotmg/atlas/Spritesheet";
import { BasicTexture } from "common/asset/rotmg/data/Texture";
import PopupManager from "PopupManager";

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

	getNumberInput(name: string, value: keyof Equipment ) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(this.state.equip[value] as number) = parseFloat(ev.target.value);
			this.onValueUpdate();
		}
		return (
			<div key={value} className={styles.equipmentProperty}>
				{name}:
				<input name={value} type="number" value={this.state.equip[value] as number} onChange={onChange}></input>
			</div>
		)
	}

	getStringInput(name: string, value: keyof Equipment) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(this.state.equip[value] as string) = ev.target.value;
			this.onValueUpdate();
		}
		return (
			<div key={value} className={styles.equipmentProperty}>
				{name}:
				<input name={value} type="text" value={this.state.equip[value] as string} onChange={onChange}></input>
			</div>
		)
	}

	getGeneralValues() {
		return [
			this.getStringInput("ID", "id")
		]
	}

	getEquipmentValues() {
		return [
			this.getNumberInput("Rate of Fire", "rateOfFire"),
			this.getNumberInput("Arc Gap", "arcGap"),
			this.getNumberInput("Shots", "numProjectiles")
		]
	}

	getProjectileValues() {
		const getNumber = (name: string, value: keyof Projectile, obj: Projectile) => {
			const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				(obj[value] as number) = parseFloat(e.target.value);
				this.onValueUpdate()
			}

			return (
				<div key={value} className={styles.equipmentProperty}>
					{name}:
					<input name={value} type="number" value={obj[value] as number} onChange={onChange}></input>
				</div>
			)
		}

		return this.state.equip.projectiles.map((proj) => 
			<div className={styles.projectileContainer}>
				{getNumber("Min Damage", "minDamage", proj)}
				{getNumber("Max Damage", "maxDamage", proj)}
				{getNumber("Speed", "speed", proj)}
				{getNumber("Lifetime", "lifetime", proj)}
				{getNumber("Amplitude", "amplitude", proj)}
				{getNumber("Frequency", "frequency", proj)}
			</div>
		)
	}

	onValueUpdate() {
		this.forceUpdate();
		const bundle = assetManager.getBundle(this.state.bundleName);
		if (bundle === undefined) return;
		bundle.dirty = true;
	}

	onSpritePicked = (sprite: Sprite) => {
		const texture = new BasicTexture(sprite.spriteSheetName, sprite.index, false);
		this.state.equip.texture = texture;
		this.onValueUpdate();
		PopupManager.close("spritePicker")
	}

	openSpritePicker = () => {
		PopupManager.popup("spritePicker", <SpritePicker onPicked={this.onSpritePicked} assetManager={assetManager} />)
	}

	save = () => {
		const bundle = assetManager.getBundle(this.state.bundleName) ?? new AssetBundle(this.state.bundleName);
		const container = bundle.containers.get("rotmg") as RotMGAssets ?? new RotMGAssets(false);
		container.add(this.state.equip);
		container.setMetadata({loader: "rotmg-loader", type: "rotmg"})
		bundle.containers.set("rotmg", container);
		assetManager.addBundle(bundle);
		db.set(bundle);

		this.props.onSave?.(this.state.equip);
	}

	render() {
		return <div className={styles.editEquipmentMenu}>
			<button  onClick={this.openSpritePicker}>Pick Sprite</button>
			{this.getGeneralValues()}
			{this.getEquipmentValues()}
			<div style={{columnWidth: "1 / 2", color: "white"}}>Projectile</div>
			{this.getProjectileValues()}
			{this.props.createFromExisting && <button onClick={this.save}>Create</button>}
		</div>
	}
}