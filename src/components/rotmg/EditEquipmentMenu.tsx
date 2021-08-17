import { assetManager } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import Equipment, { BagType, SlotType, Tier } from "common/asset/rotmg/data/Equipment";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import { cloneDeep } from "lodash";
import React from "react";
import styles from "./EditEquipmentMenu.module.css";
import SpriteComponent from "./Sprite";

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

	update = () => {
		const bundle = assetManager.getBundle(this.state.bundleName);
		if (bundle !== undefined) {
			bundle.dirty = true;
		}
		this.forceUpdate();
	}

	save = () => {
		if (this.props.createFromExisting) {
			const bundle = assetManager.getBundle(this.state.bundleName) ?? new AssetBundle(this.state.bundleName);
			const container = bundle.containers.get("rotmg") as RotMGAssets ?? new RotMGAssets();
			if (container.getMetadata() === undefined) {
				container.setMetadata({type: "rotmg", loader: "rotmg-loader"})
			}
	
			container.add(this.state.equip);
			bundle.containers.set("rotmg", container);
			assetManager.addBundle(bundle);
			bundle.dirty = true;
			this.props.onSave?.(this.state.equip);
		}
	}

	textProp<T>(object: T, key: keyof T) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(object[key] as any) = ev.currentTarget.value;
			this.update();
		}
		
		return (
			<input type="text" value={object[key] as any} onChange={onChange}/>
		)
	}

	numProp<T>(object: T, key: keyof T) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(object[key] as any) = Number(ev.currentTarget.value);
			this.update();
		}
	
		return (
			<input type="number" value={object[key] as any} size={4} onChange={onChange}/>
		)
	}

	enumProp<T>(object: T, key: keyof T, values: any) {
		if (values === undefined && typeof(values) !== "object")  {
			console.log(values)
			return null;
		}

		const options = [];

		for (const val of Object.keys(values)) {
			if (typeof values[val] === "string") {
				options.push(<option value={val}>{values[val]}</option>)
			}
		}

		const onChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
			(object[key] as any) = Number(ev.currentTarget.value)
			this.update()
		}

		return (
			<select onChange={onChange} value={object[key] as any}>
				{options}
			</select>
		)
	}

	tierProp(style?: string) {
		const equip = this.state.equip;

		const tiers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, "UT"];

		const onChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
			const num = Number(ev.currentTarget.value);
			if (!isNaN(num)) {
				equip.tier = num as Tier;
				this.forceUpdate();
				return;
			}
			equip.tier = ev.currentTarget.value as Tier;

			this.update();
		}

		return this.formatProp("Tier",
			<select onChange={onChange} value={equip.tier}>
				{tiers.map((tier) => (<option value={tier}>{tier}</option>))}
			</select>, style
		)
	}

	formatProp(name: string, node: React.ReactNode, style?: string) {
		return (
			<div className={styles.property + " " + style}>
				<div className={styles.propertyName}>{name}</div>
				{node}
			</div>
		)
	}

	getWeaponProperties() {
		const equip = this.state.equip;
		if (!equip.isWeapon()) return null;

		return [
			<div className={styles.sectionHeader}>Weapon Settings</div>,
			this.formatProp("ROF", this.numProp(equip, "rateOfFire"), styles.rateOfFire),
			this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), styles.arcGap),
			this.formatProp("Shot Count", this.numProp(equip, "numProjectiles"), styles.numProjectiles)
		]
	}

	getProjectileProperties() {
		const equip = this.state.equip;
		if (!equip.hasProjectiles()) return null;
		const proj = this.state.equip.projectiles[0];

		const damage = (
			<div className={styles.property + " " + styles.damage}>
				<div className={styles.propertyName}>Damage</div>
				<div className={styles.damageInputs}>
					{this.numProp(proj, "minDamage")} - {this.numProp(proj, "maxDamage")}
				</div>
			</div>
		)

		return [
			<div className={styles.sectionHeader}>Projectile Settings</div>,
			damage,
			this.formatProp("Amplitude", this.numProp(proj, "amplitude"), styles.amplitude),
			this.formatProp("Frequency", this.numProp(proj, "frequency"), styles.frequency),
			this.formatProp("Lifetime", this.numProp(proj, "lifetime"), styles.lifetime),
			this.formatProp("Speed", this.numProp(proj, "speed"), styles.speed),
		]
	}

	render() {
		const equip = this.state.equip;
		return <div className={styles.editEquipmentMenu}>
			<div className={styles.sprite}>
				<SpriteComponent texture={this.state.equip.texture} />
			</div>

			{this.formatProp("ID", this.textProp(equip, "id"), styles.id)}
			{this.tierProp(styles.tier)}
			{this.formatProp("Bag Type", this.enumProp(equip, "bagType", BagType), styles.bagType)}
			{this.formatProp("Slot Type", this.enumProp(equip, "slotType", SlotType), styles.slotType)}

			{this.getWeaponProperties()}
			{this.getProjectileProperties()}

			<button className={styles.save} onClick={this.save}>Save</button>
		</div>
	}
}