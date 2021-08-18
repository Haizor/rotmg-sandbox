import { assetManager } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
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

	uploadSprite = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = false;
		input.click();

		input.onchange = async () => {
			if (input.files !== null && input.files[0] !== undefined) {
				const file = input.files[0];
				const img = new Image();
				img.src = URL.createObjectURL(file)
				img.addEventListener("load", () => URL.revokeObjectURL(img.src));

				const bundle = assetManager.getBundle(this.state.bundleName) ?? new AssetBundle(this.state.bundleName);
				const container = bundle.containers.get("sprites") as CustomSpritesheet ?? new CustomSpritesheet(this.state.bundleName);

				let sprite;
				
				if (this.props.createFromExisting) {
					sprite = await container.add(img);
				} else {
					const index = this.state.equip.texture?.getTexture(0).index;
					if (index === undefined) return;
					sprite = await container.set(index, img);
				}

				if (sprite === undefined) return;

				container.setMetadata({loader: "custom-sprite-loader", type: "sprites"});
				bundle.containers.set("sprites", container);
				assetManager.addBundle(bundle);

				this.state.equip.texture = sprite.asTexture();

				this.update()
			}
			input.remove()
		}
	}

	textProp<T>(object: T, key: keyof T, multiLine?: boolean) {
		const onChange = (ev: React.ChangeEvent<any>) => {
			(object[key] as any) = ev.currentTarget.value;
			this.update();
		}

		if (multiLine === true) {
			return (
				<textarea value={object[key] as any} onChange={onChange} />
			)
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

	boolProp<T>(object: T, key: keyof T) {
		const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
			(object[key] as any) = ev.currentTarget.checked;
			this.update();
		}

		return (
			<input type="checkbox" checked={object[key] as any} onChange={onChange}/>
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
			<div className={styles.section + " " + styles.threeColumn}>
				{this.formatProp("ROF", this.numProp(equip, "rateOfFire"), styles.rateOfFire)}
				{this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), styles.arcGap)}
				{this.formatProp("Shot Count", this.numProp(equip, "numProjectiles"), styles.numProjectiles)}
			</div>
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
			<div className={styles.section + " " + styles.fourColumn}>
				{damage}
				{this.formatProp("Amplitude", this.numProp(proj, "amplitude"), styles.amplitude)}
				{this.formatProp("Frequency", this.numProp(proj, "frequency"), styles.frequency)}
				{this.formatProp("Lifetime", this.numProp(proj, "lifetime"), styles.lifetime)}
				{this.formatProp("Speed", this.numProp(proj, "speed"), styles.speed)}

			</div>,
			<div className={styles.section + " " + styles.threeColumn}>
				{this.formatProp("Acceleration", this.numProp(proj, "acceleration"), styles.speed)}
				{this.formatProp("Acceleration Delay", this.numProp(proj, "accelerationDelay"), styles.speed)}
				{this.formatProp("Speed Clamp", this.numProp(proj, "speedClamp"), styles.speed)}
			</div>,
			<div className={styles.section + " " + styles.fourColumn}>
				{this.formatProp("Passes Cover", this.boolProp(proj, "passesCover"), styles.speed)}
				{this.formatProp("Armor Piercing", this.boolProp(proj, "armorPiercing"), styles.speed)}
				{this.formatProp("Piercing", this.boolProp(proj, "multiHit"), styles.speed)}
				{this.formatProp("Boomerang", this.boolProp(proj, "boomerang"), styles.speed)}
			</div>,
		]
	}

	getStatProperties() {
		const stats = this.state.equip.stats;

		return [
			<div className={styles.sectionHeader}>Stats</div>,
			<div className={styles.section + " " + styles.fourColumn}>
				{this.formatProp("HP", this.numProp(stats, "hp"), styles.stat)}
				{this.formatProp("MP", this.numProp(stats, "mp"), styles.stat)}
				{this.formatProp("VIT", this.numProp(stats, "vit"), styles.stat)}
				{this.formatProp("WIS", this.numProp(stats, "wis"), styles.stat)}
				{this.formatProp("ATK", this.numProp(stats, "atk"), styles.stat)}
				{this.formatProp("DEF", this.numProp(stats, "def"), styles.stat)}
				{this.formatProp("SPD", this.numProp(stats, "spd"), styles.stat)}
				{this.formatProp("DEX", this.numProp(stats, "dex"), styles.stat)}
			</div>

		]
	}

	render() {
		const equip = this.state.equip;
		return <div className={styles.editEquipmentMenu}>
			<div className={styles.sprite} onClick={this.uploadSprite}>
				<SpriteComponent texture={this.state.equip.texture} />
			</div>

			{this.formatProp("ID", this.textProp(equip, "id"), styles.id)}
			{this.formatProp("Description", this.textProp(equip, "description", true), styles.description)}
			{this.tierProp(styles.tier)}
			{this.formatProp("Bag Type", this.enumProp(equip, "bagType", BagType), styles.bagType)}
			{this.formatProp("Slot Type", this.enumProp(equip, "slotType", SlotType), styles.slotType)}

			{this.getStatProperties()}
			{this.getWeaponProperties()}
			{this.getProjectileProperties()}

			{this.props.createFromExisting && <button className={styles.save} onClick={this.save}>Save</button>}
		</div>
	}
}