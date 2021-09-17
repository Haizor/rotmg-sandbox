import { assetManager } from "Assets";
import AssetBundle from "common/asset/normal/AssetBundle";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
import Activate, { Proc } from "common/asset/rotmg/data/activate/Activate";
import { activateConstructors } from "common/asset/rotmg/data/activate/ActivateParser";
import BoostRange from "common/asset/rotmg/data/activate/BoostRange";
import BulletCreate from "common/asset/rotmg/data/activate/BulletCreate";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import Decoy from "common/asset/rotmg/data/activate/Decoy";
import EffectBlast from "common/asset/rotmg/data/activate/EffectBlast";
import Heal from "common/asset/rotmg/data/activate/Heal";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import Magic from "common/asset/rotmg/data/activate/Magic";
import ObjectToss from "common/asset/rotmg/data/activate/ObjectToss";
import PoisonGrenade from "common/asset/rotmg/data/activate/PoisonGrenade";
import Shoot from "common/asset/rotmg/data/activate/Shoot";
import ShurikenAbility from "common/asset/rotmg/data/activate/ShurikenAbility";
import Teleport from "common/asset/rotmg/data/activate/Teleport";
import Trap from "common/asset/rotmg/data/activate/Trap";
import VampireBlast from "common/asset/rotmg/data/activate/VampireBlast";
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
		<div key="header" className={styles.sectionHeader} style={{cursor: "pointer"}} onClick={(() => setToggled(!toggled))}>{props.name}</div>,
	]

	if (toggled) {
		result.push(<div key={"data"} className={styles.section + " " + styles.fourColumn}>{props.children}</div>)
	}

	return <div className={styles.section}>
		{result}
	</div>;
}

export default class EditEquipmentMenu extends React.Component<Props, State> {
	original?: Equipment;
	static activateMappers: Map<string, ActivateMapper> = new Map();
	constructor(props: Props) {
		super(props);
		this.state = this.updateFromProps()
	}

	updateFromProps() {
		let equip = this.props.equip;

		if (this.props.createFromExisting) {
			this.original = equip;
			equip = cloneDeep(equip);
		}

		const result = assetManager.get<Equipment>("rotmg", equip.id);

		return {equip, bundleName: result?.bundle.name ?? ""};
	}

	update = () => {
		const bundle = assetManager.getBundle(this.state.bundleName);
		if (bundle !== undefined) {
			bundle.dirty = true;
		}
		this.forceUpdate();
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps !== this.props) {
			this.setState(this.updateFromProps());
		}
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
				options.push(<option key={val} value={val}>{values[val]}</option>)
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
				{tiers.map((tier) => (<option key={tier} value={tier}>{tier}</option>))}
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
			{activates.map((activate, index) => this.getActivateEditor(activate, index))}
			<button onClick={addNew} className={styles.span4}>Add New</button>
		</CollapsibleSection>
	}

	getProcs(name: string, key: keyof(Equipment)) {
		const procs = this.state.equip[key] as Proc[];
		
		const addNew = () => {
			const newProc = new Shoot() as Proc;
			newProc.cooldown = 1;
			newProc.proc = 1;
			(this.state.equip[key] as Proc[]).push(newProc);
			this.update()
		}

		return <CollapsibleSection name={name}>
			{procs.map((proc, index) => this.getProcEditor(key, proc, index))}
			<button onClick={addNew} className={styles.span4}> Add New</button>
		</CollapsibleSection>
	}

	getProcEditor(key: keyof(Equipment), proc: Proc, index: number) {
		const activates = this.state.equip[key] as Proc[];
		const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			const constructor = activateConstructors.get(e.target.value);
			if (constructor === undefined) return;
			//thank you linting for making me do this
			activates[index] = new constructor({})
			activates[index].proc = 1;
			activates[index].cooldown = 1;
			this.update()
		}

		const remove = () => {
			delete (this.state.equip[key] as Proc[])[index];
			this.update()
		}

		let activateFields = EditEquipmentMenu.activateMappers.get(proc.getName())?.call(this, proc) ?? []

		return [
			<div key={index} className={styles.activate}>
				{this.formatProp("Proc", this.numProp(activates[index], "proc"), styles.span1)}
				{this.formatProp("Cooldown", this.numProp(activates[index], "cooldown"), styles.span1)}
				{this.formatProp("Required Condition", this.enumProp(activates[index], "requiredConditions", StatusEffectType), styles.span2)}
				<div className={styles.activateRow}>

					<select className={styles.activateName} value={proc.getName()} onChange={onChange}>
						{Array.of(...activateConstructors.entries()).map(([key, value]) => {
							return <option key={key} className={styles.activateOption} value={key}>{key}</option>
						})}
					</select>
					<div onClick={remove}>🗑️</div>
				</div>
				{activateFields}
			</div>
		]
	}

	getActivateEditor(activate: Activate, index: number) {
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

		let activateFields = EditEquipmentMenu.activateMappers.get(activate.getName())?.call(this, activate) ?? []

		return [
			<div key={index} className={styles.activate}>
				<div className={styles.activateRow}>
					<select className={styles.activateName} value={activate.getName()} onChange={onChange}>
						{Array.of(...activateConstructors.entries()).map(([key, value]) => {
							return <option key={key} className={styles.activateOption} value={key}>{key}</option>
						})}
					</select>
					<div onClick={remove}>🗑️</div>
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
					<div className={styles.row}>
						<div className={styles.sprite} onClick={this.uploadSprite}>
							<SpriteComponent texture={this.state.equip.texture} />
						</div>

						{this.formatProp("ID", this.textProp(equip, "id"), styles.id)}
					</div>

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
						this.formatProp("Multi Phase", this.boolProp(equip, "multiPhase"), styles.span2),
						this.state.equip.multiPhase && [
							this.formatProp("MP Per Second", this.numProp(equip, "mpCostPerSecond"), styles.span2),
							this.formatProp("MP End Cost", this.numProp(equip, "mpEndCost"), styles.span2)
						],
	
	
					]}

				</CollapsibleSection>

				{this.getStatProperties()}
				{this.getWeaponProperties()}
				{this.getProjectileProperties()}
				{this.getActivates()}
				{this.getProcs("Shoot Procs", "onShootProcs")}
				{this.getProcs("Ability Procs", "abilityProcs")}
				{this.getProcs("Hit Procs", "onHitProcs")}
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

type ActivateMapper = (this: EditEquipmentMenu, activate: any) => React.ReactNodeArray;

EditEquipmentMenu.activateMappers.set("BoostRange", function(activate: BoostRange) {
	return [
		this.formatProp("Radius", this.numProp(activate, "radius"), styles.span1),
		this.formatProp("Speed Boost", this.numProp(activate, "speedBoost"), styles.span1),
		this.formatProp("Life Boost", this.numProp(activate, "lifeBoost"), styles.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
	]
})

EditEquipmentMenu.activateMappers.set("BulletCreate", function(activate: BulletCreate) {
	return [
		this.formatProp("Min Dist", this.numProp(activate, "minDistance"), styles.span1),
		this.formatProp("Max Dist", this.numProp(activate, "maxDistance"), styles.span1),
		this.formatProp("Offset Angle", this.numProp(activate, "offsetAngle"), styles.span1),
		this.formatProp("Num Shots", this.numProp(activate, "numShots"), styles.span1),
		this.formatProp("Gap Angle", this.numProp(activate, "gapAngle"), styles.span1),
		this.formatProp("Gap Dist", this.numProp(activate, "gapTiles"), styles.span1),
		this.formatProp("Arc Gap", this.numProp(activate, "arcGap"), styles.span1),
	];
})

EditEquipmentMenu.activateMappers.set("BulletNova", function(activate: BulletNova) {
	return [this.formatProp("Num Shots", this.numProp(activate, "numShots"), styles.span3)];
})


EditEquipmentMenu.activateMappers.set("ConditionEffectAura", function(activate: ConditionEffectAura) {
	return [
		this.formatProp("Status Effect", this.enumProp(activate, "effect", StatusEffectType), styles.span4),
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
		this.formatProp("Range", this.numProp(activate, "range"), styles.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1),
		this.formatProp("Wis Per Duration", this.numProp(activate, "wisPerDuration"), styles.span2),
		this.formatProp("Wis Duration Base", this.numProp(activate, "wisDurationBase"), styles.span2),
	];
})

EditEquipmentMenu.activateMappers.set("ConditionEffectSelf", function(activate: ConditionEffectSelf) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "effect", StatusEffectType), styles.span2),
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1),
		this.formatProp("Wis Per Duration", this.numProp(activate, "wisPerDuration"), styles.span2),
		this.formatProp("Wis Duration Base", this.numProp(activate, "wisDurationBase"), styles.span2),
	];
})

EditEquipmentMenu.activateMappers.set("Decoy", function(activate: Decoy) {
	return [
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
		this.formatProp("Speed", this.numProp(activate, "speed"), styles.span1),
		this.formatProp("Distance", this.numProp(activate, "distance"), styles.span1),
		this.formatProp("Angle", this.numProp(activate, "angleOffset"), styles.span1),
	];
})

EditEquipmentMenu.activateMappers.set("EffectBlast", function(activate: EffectBlast) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), styles.span4),
		this.formatProp("Duration", this.numProp(activate, "condDuration"), styles.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), styles.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1),
		this.formatProp("Collapse", this.boolProp(activate, "collapseEffect"), styles.span1),
	];
})

EditEquipmentMenu.activateMappers.set("Heal", function(activate: Heal) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), styles.span4)
	]
})

EditEquipmentMenu.activateMappers.set("HealNova", function(activate: HealNova) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), styles.span2),
		this.formatProp("Range", this.numProp(activate, "range"), styles.span2),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1),
		this.formatProp("Wis Per Increase", this.numProp(activate, "wisPerIncrease"), styles.span1),
		this.formatProp("Wis Heal Base", this.numProp(activate, "wisHealBase"), styles.span1)
	]
})

EditEquipmentMenu.activateMappers.set("Magic", function(activate: Magic) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), styles.span4)
	]
})

EditEquipmentMenu.activateMappers.set("ObjectToss", function(activate: ObjectToss) {
	return [
		this.formatProp("Object ID", this.textProp(activate, "objectId"), styles.span3),
		this.formatProp("Throw Time", this.textProp(activate, "throwTime"), styles.span1),
	]
}) 

EditEquipmentMenu.activateMappers.set("PoisonGrenade", function(activate: PoisonGrenade) {
	return [
		this.formatProp("Impact DMG", this.numProp(activate, "impactDamage"), styles.span1),
		this.formatProp("Total DMG", this.numProp(activate, "totalDamage"), styles.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), styles.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
		this.formatProp("Throw Time", this.numProp(activate, "throwTime"), styles.span1),
	]
}) 

EditEquipmentMenu.activateMappers.set("Shoot", function(activate: Shoot) {
	return [];
})

EditEquipmentMenu.activateMappers.set("ShurikenAbility", function(activate: ShurikenAbility) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "effect", StatusEffectType), styles.span4),
		this.formatProp("Enable Mana Regen", this.boolProp(activate, "enableManaRegen"), styles.span1),
		this.formatProp("Enable Generic Mana Heal", this.boolProp(activate, "enableGenericManaHealing"), styles.span1),
		this.formatProp("Enable Pet Mana Healing", this.boolProp(activate, "enablePetManaHealing"), styles.span1)
	]
})

EditEquipmentMenu.activateMappers.set("Teleport", function(activate: Teleport) {
	return [
		this.formatProp("Max Dist", this.numProp(activate, "maxDistance"), styles.span4)
	]
})

EditEquipmentMenu.activateMappers.set("Trap", function(activate: Trap) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), styles.span3),
		this.formatProp("Effect Duration", this.numProp(activate, "condDuration"), styles.span1),
		this.formatProp("Damage", this.numProp(activate, "totalDamage"), styles.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), styles.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), styles.span1),
		this.formatProp("Throw Time", this.numProp(activate, "throwTime"), styles.span1),
		this.formatProp("Sensitivity", this.numProp(activate, "sensitivity"), styles.span1),
	]
})

EditEquipmentMenu.activateMappers.set("VampireBlast", function(activate: VampireBlast) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), styles.span3),
		this.formatProp("Duration", this.numProp(activate, "condDuration"), styles.span1),
		this.formatProp("Damage", this.numProp(activate, "totalDamage"), styles.span2),
		this.formatProp("DMG Radius", this.numProp(activate, "radius"), styles.span1),
		this.formatProp("Ignore Def", this.numProp(activate, "ignoreDef"), styles.span1),
		this.formatProp("Heal", this.numProp(activate, "heal"), styles.span1),
		this.formatProp("Heal Radius", this.numProp(activate, "healRange"), styles.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), styles.span1),
		this.formatProp("Wis Per DMG", this.numProp(activate, "wisPerIncrease"), styles.span1),
		this.formatProp("Wis DMG Base", this.numProp(activate, "wisDamageBase"), styles.span1),
		this.formatProp("Wis Per DMG Radius", this.numProp(activate, "wisPerRad"), styles.span1),
		this.formatProp("Wis DMG Radius Base", this.numProp(activate, "incrRad"), styles.span1),
	]
})