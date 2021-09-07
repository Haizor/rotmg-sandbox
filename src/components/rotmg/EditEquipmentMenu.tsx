import { assetManager } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
import Activate from "common/asset/rotmg/data/activate/Activate";
import { activateConstructors } from "common/asset/rotmg/data/activate/ActivateParser";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import Shoot from "common/asset/rotmg/data/activate/Shoot";
import Equipment, { BagType, SlotType, Tier } from "common/asset/rotmg/data/Equipment";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import { cloneDeep } from "lodash";
import React, { useState } from "react";
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

function CollapsibleSection(props: { name: string, children: React.ReactNode}) {
	const [toggled, setToggled] = useState(true)

	const result = [
		<div className={styles.sectionHeader} style={{cursor: "pointer"}} onClick={(() => setToggled(!toggled))}>{props.name}</div>,
	]

	if (toggled) {
		result.push(<div className={styles.section + " " + styles.fourColumn}>{props.children}</div>)
	}

	return <div className={styles.section}>
		{result}
	</div>;
}

export default class EditEquipmentMenu extends React.Component<Props, State> {
	original?: Equipment
	constructor(props: Props) {
		super(props);
		let equip = props.equip;

		if (props.createFromExisting) {
			this.original = equip;
			equip = cloneDeep(equip);
		}

		const result = assetManager.get<Equipment>("rotmg", equip.id);

		this.state = {equip, bundleName: result?.bundle.name ?? ""};
	}

	update = () => {
		const bundle = assetManager.getBundle(this.state.bundleName);
		if (bundle !== undefined) {
			bundle.dirty = true;
		}
		this.forceUpdate();
	}

	canSave = () => {
		if (this.props.createFromExisting) {
			if (this.original?.id === this.state.equip.id) {
				return {
					success: false,
					message: "ID can't be the same as the source objects!"
				};
			}
			if (this.state.bundleName === "") {
				return {
					success: false,
					message: "Bundle name can't be empty!"
				}
			}
			const bundle = assetManager.getBundle(this.state.bundleName);
			if (bundle && bundle.default) {
				return {
					success: false,
					message: "Can't save into a default bundle!"
				}
			}
		}
		return {
			success: true
		}
	}

	save = () => {
		if (this.props.createFromExisting && this.canSave()) {
			console.log(this.state.bundleName)
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

				const bundle = assetManager.getBundle(this.state.bundleName);
				if (bundle === undefined) return;
				const container = bundle.containers.get("sprites") as CustomSpritesheet ?? new CustomSpritesheet(this.state.bundleName);

				let sprite;

				const tex = this.state.equip.texture?.getTexture(0);
				if (tex !== undefined && container.name === tex?.file) {
					sprite = await container.set(tex.index, img);
				} else {
					sprite = await container.add(img);
				}
				
				
				// if (this.props.createFromExisting) {
				// 	sprite = await container.add(img);
				// } else {
				// 	const index = this.state.equip.texture?.getTexture(0).index;
				// 	if (index === undefined) return;
				// 	sprite = await container.set(index, img);
				// }

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

		return <CollapsibleSection name="Weapon Settings">
			<div className={styles.section + " " + styles.threeColumn}>
				{this.formatProp("ROF", this.numProp(equip, "rateOfFire"), styles.span1)}
				{this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), styles.span1)}
				{this.formatProp("Shot Count", this.numProp(equip, "numProjectiles"), styles.span1)}
			</div>
		</CollapsibleSection>
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

		return <CollapsibleSection name="Projectile">
			<div className={styles.section + " " + styles.fourColumn}>
				{damage}
				{this.formatProp("Amplitude", this.numProp(proj, "amplitude"), styles.span1)}
				{this.formatProp("Frequency", this.numProp(proj, "frequency"), styles.span1)}
				{this.formatProp("Lifetime", this.numProp(proj, "lifetime"), styles.span1)}
				{this.formatProp("Speed", this.numProp(proj, "speed"), styles.span1)}

			</div>
			<div className={styles.section + " " + styles.threeColumn}>
				{this.formatProp("Acceleration", this.numProp(proj, "acceleration"), styles.span1)}
				{this.formatProp("Acceleration Delay", this.numProp(proj, "accelerationDelay"), styles.span1)}
				{this.formatProp("Speed Clamp", this.numProp(proj, "speedClamp"), styles.span1)}
			</div>
			<div className={styles.section + " " + styles.fourColumn}>
				{this.formatProp("Passes Cover", this.boolProp(proj, "passesCover"), styles.span1)}
				{this.formatProp("Armor Piercing", this.boolProp(proj, "armorPiercing"), styles.span1)}
				{this.formatProp("Piercing", this.boolProp(proj, "multiHit"), styles.span1)}
				{this.formatProp("Boomerang", this.boolProp(proj, "boomerang"), styles.span1)}
			</div>
		</CollapsibleSection>
	}

	getStatProperties() {
		const stats = this.state.equip.stats;

		return <CollapsibleSection name="Stats">
			{this.formatProp("HP", this.numProp(stats, "hp"), styles.span1)}
			{this.formatProp("MP", this.numProp(stats, "mp"), styles.span1)}
			{this.formatProp("VIT", this.numProp(stats, "vit"), styles.span1)}
			{this.formatProp("WIS", this.numProp(stats, "wis"), styles.span1)}
			{this.formatProp("ATK", this.numProp(stats, "atk"), styles.span1)}
			{this.formatProp("DEF", this.numProp(stats, "def"), styles.span1)}
			{this.formatProp("SPD", this.numProp(stats, "spd"), styles.span1)}
			{this.formatProp("DEX", this.numProp(stats, "dex"), styles.span1)}
		</CollapsibleSection>
	}

	getActivates() {
		if (!this.state.equip.isAbility()) return null;

		const activates = this.state.equip.activates;

		const addNew = () => {
			this.state.equip.activates.push(new Shoot());
			this.update()
		}

		return <CollapsibleSection name="Activates">
			<button onClick={addNew} className={styles.span4}>Add New</button>
			{activates.map((activate, index) => this.getActivateEditor(activate, index))}
		</CollapsibleSection>
	}

	getActivateEditor(activate: Activate, index: number) {
		let activateFields = [];

		const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			const constructor = activateConstructors.get(e.target.value);
			if (constructor === undefined) return;
			//thank you linting for making me do this
			const activates = this.state.equip.activates;
			activates[index] = new constructor({})
			this.update()
		}

		const remove = () => {
			delete this.state.equip.activates[index];
			this.update()
		}

		if (activate instanceof BulletNova) {
			activateFields.push(this.formatProp("Num Shots", this.numProp(activate, "numShots"), styles.span3))
		} 
		if (activate instanceof ConditionEffectAura || activate instanceof ConditionEffectSelf) {
			const aura = activate instanceof ConditionEffectAura;
			activateFields.push(this.formatProp("Effect", this.enumProp(activate, "effect", StatusEffectType), styles.span2))
			activateFields.push(this.formatProp("Duration", this.numProp(activate, "duration"), aura ? styles.span1 : styles.span2))
			if (activate instanceof ConditionEffectAura) {
				activateFields.push(this.formatProp("Range", this.numProp(activate, "range"), styles.span1))
			}
			activateFields.push(this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1))
			activateFields.push(this.formatProp("Wis Per Duration", this.numProp(activate, "wisPerDuration"), styles.span2))
			activateFields.push(this.formatProp("Wis Duration Base", this.numProp(activate, "wisDurationBase"), styles.span1))
		}
		if (activate instanceof HealNova) {
			activateFields.push(this.formatProp("Range", this.numProp(activate, "range"), styles.span1))
			activateFields.push(this.formatProp("Amount", this.numProp(activate, "amount"), styles.span2))
			activateFields.push(this.formatProp("Split Healing", this.boolProp(activate, "splitHealing"), styles.span1))

			activateFields.push(this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1))
			activateFields.push(this.formatProp("Wis Per Increase", this.numProp(activate, "wisPerIncrease"), styles.span2))
			activateFields.push(this.formatProp("Wis Heal Base", this.numProp(activate, "wisHealBase"), styles.span1))
		}

		return [
			<div className={styles.activate}>
				<div className={styles.activateRow}>
					<select className={styles.activateName} value={activate.getName()} onChange={onChange}>
						{Array.of(...activateConstructors.entries()).map(([key, value]) => {
							return <option className={styles.activateOption} value={key}>{key}</option>
						})}
					</select>
					<div onClick={remove}>X</div>
				</div>
				{activateFields}
			</div>
		]
	}

	render() {
		const equip = this.state.equip;
		const canSave = this.canSave();
		return <div className={styles.container}>
			<div className={styles.editEquipmentMenu}>
				<CollapsibleSection name="General">
					<div className={styles.sprite} onClick={this.uploadSprite}>
						<SpriteComponent texture={this.state.equip.texture} />
					</div>

					{this.formatProp("ID", this.textProp(equip, "id"), styles.id)}
					{this.formatProp("Description", this.textProp(equip, "description", true), styles.description)}
					{this.tierProp(styles.span1)}
					{this.formatProp("Bag Type", this.enumProp(equip, "bagType", BagType), styles.span1)}
					{this.formatProp("Slot Type", this.enumProp(equip, "slotType", SlotType), styles.span1)}
					{this.state.equip.hasProjectiles() && [
						this.formatProp("Num Projectiles", this.numProp(equip, "numProjectiles"), styles.span2),
						this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), styles.span2)
					]}
					{this.state.equip.isAbility() && [
						this.formatProp("MP Cost", this.numProp(equip, "mpCost"), styles.span1),
						this.formatProp("Cooldown", this.numProp(equip, "cooldown"), styles.span1),
					]}

				</CollapsibleSection>

				{this.getStatProperties()}
				{this.getWeaponProperties()}
				{this.getProjectileProperties()}
				{this.getActivates()}
			</div>
			<div className={styles.saveArea}>
				{!canSave.success && <div className={styles.error}>{canSave.message}</div>}
				{this.props.createFromExisting && [
					this.formatProp("Bundle Name", this.textProp(this.state, "bundleName")),
					<button className={styles.save} disabled={!canSave.success} onClick={this.save}>Save</button>,

				]}
			</div>
		</div>
	}
}