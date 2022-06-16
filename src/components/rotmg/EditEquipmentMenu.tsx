import { assetManager } from "Assets";
import { cloneDeep } from "lodash";
import PopupManager from "PopupManager";
import React from "react";
import { Equipment, ProjectileRender, AssetBundle, RotMGAssets, CustomSpritesheet, Tier, Shoot, Proc, activateConstructors, StatusEffectType, Activate, BagType, SlotType, BoostRange, BulletCreate, BulletNova, ConditionEffectAura, ConditionEffectSelf, Decoy, EffectBlast, Heal, HealNova, Magic, ObjectToss, PoisonGrenade, ShurikenAbility, Trap, VampireBlast } from "@haizor/rotmg-utils";

import styles from "./EditEquipmentMenu.module.css";
import EditProjectileMenu from "./EditProjectileMenu";
import Form, { CollapsibleSection } from "./Form";
import SpriteComponent from "./Sprite";
import Teleport from "@haizor/rotmg-utils/dist/asset/rotmg/data/activate/Teleport";

type Props = {
	equip: Equipment
	createFromExisting: boolean;
	onSave?: (equip: Equipment) => void
}

type State = {
	equip: Equipment,
	bundleName: string,
	projectileObject?: ProjectileRender;
}

export default class EditEquipmentMenu extends Form<Props, State> {
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

		const result = assetManager.get<Equipment>("equipment", equip.id);

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
			const container = bundle.containers.get("equipment") as RotMGAssets ?? new RotMGAssets();
			if (container.getMetadata() === undefined) {
				container.setMetadata({type: "equipment", loader: "rotmg-loader"})
			}
	
			container.add(this.state.equip);
			if (this.state.projectileObject)
				container.add(this.state.projectileObject)
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

	openProjectileRenderEditor = () => {
		const getResult = assetManager.get<ProjectileRender>("rotmg", this.state.equip.projectiles[0].objectId);
		const projectile = this.state.projectileObject ?? getResult?.value;
		if (projectile !== undefined) {
			const id = projectile.id;
			const onSave = (proj: ProjectileRender) => {
				PopupManager.close(`projectileEditor+${id}`);
				this.setState({projectileObject: proj})
				this.state.equip.projectiles[0].objectId = proj.id;
			}

			const onUpdate = (proj: ProjectileRender) => {
				if (!this.props.createFromExisting) {
					this.state.equip.projectiles[0].objectId = proj.id;
				}
			}
			
			PopupManager.popup(`projectileEditor+${id}`, 
				<EditProjectileMenu 
					proj={projectile} 
					bundleName={this.state.bundleName}
					createFromExisting={projectile.readOnly}
					onSave={onSave}
					onUpdate={onUpdate}
				/>
			)
		}

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

	getWeaponProperties() {
		const equip = this.state.equip;
		if (!equip.isWeapon()) return null;

		return <CollapsibleSection name="Weapon Settings">
			<div className={this.formStyle.section + " " + this.formStyle.threeColumn}>
				{this.formatProp("ROF", this.numProp(equip, "rateOfFire"), this.formStyle.span1)}
				{this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), this.formStyle.span1)}
				{this.formatProp("Shot Count", this.numProp(equip, "numProjectiles"), this.formStyle.span1)}
			</div>
		</CollapsibleSection>
	}

	getProjectileProperties() {
		const equip = this.state.equip;
		if (!equip.hasProjectiles()) return null;
		const proj = this.state.equip.projectiles[0];
		const form = this.formStyle;

		const damage = (
			<div className={form.property + " " + styles.damage}>
				<div className={form.propertyName}>Damage</div>
				<div className={styles.damageInputs}>
					{this.numProp(proj, "minDamage")} - {this.numProp(proj, "maxDamage")}
				</div>
			</div>
		)

		return <CollapsibleSection name="Projectile">
			<div className={form.section + " " + form.fourColumn}>
				{damage}
				{this.formatProp("Amplitude", this.numProp(proj, "amplitude"), form.span1)}
				{this.formatProp("Frequency", this.numProp(proj, "frequency"), form.span1)}
				{this.formatProp("Lifetime", this.numProp(proj, "lifetime"), form.span1)}
				{this.formatProp("Speed", this.numProp(proj, "speed"), form.span1)}

			</div>
			<div className={form.section + " " + form.threeColumn}>
				{this.formatProp("Acceleration", this.numProp(proj, "acceleration"), form.span1)}
				{this.formatProp("Acceleration Delay", this.numProp(proj, "accelerationDelay"), form.span1)}
				{this.formatProp("Speed Clamp", this.numProp(proj, "speedClamp"), form.span1)}
			</div>
			<div className={form.section + " " + form.fourColumn}>
				{this.formatProp("Passes Cover", this.boolProp(proj, "passesCover"), form.span1)}
				{this.formatProp("Armor Piercing", this.boolProp(proj, "armorPiercing"), form.span1)}
				{this.formatProp("Piercing", this.boolProp(proj, "multiHit"), form.span1)}
				{this.formatProp("Boomerang", this.boolProp(proj, "boomerang"), form.span1)}
			</div>
			<div className={form.section + " " + styles.form}>
				<button onClick={this.openProjectileRenderEditor} className={form.span4}>Render Settings</button>
			</div>
		</CollapsibleSection>
	}

	getStatProperties() {
		const stats = this.state.equip.stats;

		return <CollapsibleSection name="Stats">
			{this.formatProp("HP", this.numProp(stats, "hp"), this.formStyle.span1)}
			{this.formatProp("MP", this.numProp(stats, "mp"), this.formStyle.span1)}
			{this.formatProp("VIT", this.numProp(stats, "vit"), this.formStyle.span1)}
			{this.formatProp("WIS", this.numProp(stats, "wis"), this.formStyle.span1)}
			{this.formatProp("ATK", this.numProp(stats, "atk"), this.formStyle.span1)}
			{this.formatProp("DEF", this.numProp(stats, "def"), this.formStyle.span1)}
			{this.formatProp("SPD", this.numProp(stats, "spd"), this.formStyle.span1)}
			{this.formatProp("DEX", this.numProp(stats, "dex"), this.formStyle.span1)}
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
			<button onClick={addNew} className={this.formStyle.span4}>Add New</button>
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
			<button onClick={addNew} className={this.formStyle.span4}> Add New</button>
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
				{this.formatProp("Proc", this.numProp(activates[index], "proc"), this.formStyle.span1)}
				{this.formatProp("Cooldown", this.numProp(activates[index], "cooldown"), this.formStyle.span1)}
				{this.formatProp("Required Condition", this.enumProp(activates[index], "requiredConditions", StatusEffectType), this.formStyle.span2)}
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

		return <div className={this.formStyle.container}>
			<div className={styles.editEquipmentMenu}>
				<CollapsibleSection name="General">
					<div className={this.formStyle.row}>
						<div className={styles.sprite} onClick={this.uploadSprite}>
							<SpriteComponent texture={this.state.equip.texture} />
						</div>

						{this.formatProp("ID", this.textProp(equip, "id"), styles.id)}
					</div>

					{this.formatProp("Description", this.textProp(equip, "description", true), styles.description)}
					{this.tierProp(this.formStyle.span1)}
					{this.formatProp("Bag Type", this.enumProp(equip, "bagType", BagType), this.formStyle.span1)}
					{this.formatProp("Slot Type", this.enumProp(equip, "slotType", SlotType), this.formStyle.span1)}
					{this.state.equip.hasProjectiles() && [
						this.formatProp("Num Projectiles", this.numProp(equip, "numProjectiles"), this.formStyle.span2),
						this.formatProp("Arc Gap", this.numProp(equip, "arcGap"), this.formStyle.span2)
					]}
					{this.state.equip.isAbility() && [
						this.formatProp("MP Cost", this.numProp(equip, "mpCost"), this.formStyle.span1),
						this.formatProp("Cooldown", this.numProp(equip, "cooldown"), this.formStyle.span1),
						this.formatProp("Multi Phase", this.boolProp(equip, "multiPhase"), this.formStyle.span2),
						this.state.equip.multiPhase && [
							this.formatProp("MP Per Second", this.numProp(equip, "mpCostPerSecond"), this.formStyle.span2),
							this.formatProp("MP End Cost", this.numProp(equip, "mpEndCost"), this.formStyle.span2)
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
		this.formatProp("Radius", this.numProp(activate, "radius"), this.formStyle.span1),
		this.formatProp("Speed Boost", this.numProp(activate, "speedBoost"), this.formStyle.span1),
		this.formatProp("Life Boost", this.numProp(activate, "lifeBoost"), this.formStyle.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
	]
})

EditEquipmentMenu.activateMappers.set("BulletCreate", function(activate: BulletCreate) {
	return [
		this.formatProp("Min Dist", this.numProp(activate, "minDistance"), this.formStyle.span1),
		this.formatProp("Max Dist", this.numProp(activate, "maxDistance"), this.formStyle.span1),
		this.formatProp("Offset Angle", this.numProp(activate, "offsetAngle"), this.formStyle.span1),
		this.formatProp("Num Shots", this.numProp(activate, "numShots"), this.formStyle.span1),
		this.formatProp("Gap Angle", this.numProp(activate, "gapAngle"), this.formStyle.span1),
		this.formatProp("Gap Dist", this.numProp(activate, "gapTiles"), this.formStyle.span1),
		this.formatProp("Arc Gap", this.numProp(activate, "arcGap"), this.formStyle.span1),
	];
})

EditEquipmentMenu.activateMappers.set("BulletNova", function(activate: BulletNova) {
	return [this.formatProp("Num Shots", this.numProp(activate, "numShots"), this.formStyle.span3)];
})


EditEquipmentMenu.activateMappers.set("ConditionEffectAura", function(activate: ConditionEffectAura) {
	return [
		this.formatProp("Status Effect", this.enumProp(activate, "effect", StatusEffectType), this.formStyle.span4),
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
		this.formatProp("Range", this.numProp(activate, "range"), this.formStyle.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), this.formStyle.span1),
		this.formatProp("Wis Per Duration", this.numProp(activate, "wisPerDuration"), this.formStyle.span2),
		this.formatProp("Wis Duration Base", this.numProp(activate, "wisDurationBase"), this.formStyle.span2),
	];
})

EditEquipmentMenu.activateMappers.set("ConditionEffectSelf", function(activate: ConditionEffectSelf) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "effect", StatusEffectType), this.formStyle.span2),
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), this.formStyle.span1),
		this.formatProp("Wis Per Duration", this.numProp(activate, "wisPerDuration"), this.formStyle.span2),
		this.formatProp("Wis Duration Base", this.numProp(activate, "wisDurationBase"), this.formStyle.span2),
	];
})

EditEquipmentMenu.activateMappers.set("Decoy", function(activate: Decoy) {
	return [
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
		this.formatProp("Speed", this.numProp(activate, "speed"), this.formStyle.span1),
		this.formatProp("Distance", this.numProp(activate, "distance"), this.formStyle.span1),
		this.formatProp("Angle", this.numProp(activate, "angleOffset"), this.formStyle.span1),
	];
})

EditEquipmentMenu.activateMappers.set("EffectBlast", function(activate: EffectBlast) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), this.formStyle.span4),
		this.formatProp("Duration", this.numProp(activate, "condDuration"), this.formStyle.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), this.formStyle.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), this.formStyle.span1),
		this.formatProp("Collapse", this.boolProp(activate, "collapseEffect"), this.formStyle.span1),
	];
})

EditEquipmentMenu.activateMappers.set("Heal", function(activate: Heal) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), this.formStyle.span4)
	]
})

EditEquipmentMenu.activateMappers.set("HealNova", function(activate: HealNova) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), this.formStyle.span2),
		this.formatProp("Range", this.numProp(activate, "range"), this.formStyle.span2),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), this.formStyle.span1),
		this.formatProp("Wis Per Increase", this.numProp(activate, "wisPerIncrease"), this.formStyle.span1),
		this.formatProp("Wis Heal Base", this.numProp(activate, "wisHealBase"), this.formStyle.span1)
	]
})

EditEquipmentMenu.activateMappers.set("Magic", function(activate: Magic) {
	return [
		this.formatProp("Amount", this.numProp(activate, "amount"), this.formStyle.span4)
	]
})

EditEquipmentMenu.activateMappers.set("ObjectToss", function(activate: ObjectToss) {
	return [
		this.formatProp("Object ID", this.textProp(activate, "objectId"), this.formStyle.span3),
		this.formatProp("Throw Time", this.textProp(activate, "throwTime"), this.formStyle.span1),
	]
}) 

EditEquipmentMenu.activateMappers.set("PoisonGrenade", function(activate: PoisonGrenade) {
	return [
		this.formatProp("Impact DMG", this.numProp(activate, "impactDamage"), this.formStyle.span1),
		this.formatProp("Total DMG", this.numProp(activate, "totalDamage"), this.formStyle.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), this.formStyle.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
		this.formatProp("Throw Time", this.numProp(activate, "throwTime"), this.formStyle.span1),
	]
}) 

EditEquipmentMenu.activateMappers.set("Shoot", function(activate: Shoot) {
	return [];
})

EditEquipmentMenu.activateMappers.set("ShurikenAbility", function(activate: ShurikenAbility) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "effect", StatusEffectType), this.formStyle.span4),
		this.formatProp("Enable Mana Regen", this.boolProp(activate, "enableManaRegen"), this.formStyle.span1),
		this.formatProp("Enable Generic Mana Heal", this.boolProp(activate, "enableGenericManaHealing"), this.formStyle.span1),
		this.formatProp("Enable Pet Mana Healing", this.boolProp(activate, "enablePetManaHealing"), this.formStyle.span1)
	]
})

EditEquipmentMenu.activateMappers.set("Teleport", function(activate: Teleport) {
	return [
		this.formatProp("Max Dist", this.numProp(activate, "maxDistance"), this.formStyle.span4)
	]
})

EditEquipmentMenu.activateMappers.set("Trap", function(activate: Trap) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), this.formStyle.span3),
		this.formatProp("Effect Duration", this.numProp(activate, "condDuration"), this.formStyle.span1),
		this.formatProp("Damage", this.numProp(activate, "totalDamage"), this.formStyle.span1),
		this.formatProp("Radius", this.numProp(activate, "radius"), this.formStyle.span1),
		this.formatProp("Duration", this.numProp(activate, "duration"), this.formStyle.span1),
		this.formatProp("Throw Time", this.numProp(activate, "throwTime"), this.formStyle.span1),
		this.formatProp("Sensitivity", this.numProp(activate, "sensitivity"), this.formStyle.span1),
	]
})

EditEquipmentMenu.activateMappers.set("VampireBlast", function(activate: VampireBlast) {
	return [
		this.formatProp("Effect", this.enumProp(activate, "condEffect", StatusEffectType), this.formStyle.span3),
		this.formatProp("Duration", this.numProp(activate, "condDuration"), this.formStyle.span1),
		this.formatProp("Damage", this.numProp(activate, "totalDamage"), this.formStyle.span2),
		this.formatProp("DMG Radius", this.numProp(activate, "radius"), this.formStyle.span1),
		this.formatProp("Ignore Def", this.numProp(activate, "ignoreDef"), this.formStyle.span1),
		this.formatProp("Heal", this.numProp(activate, "heal"), this.formStyle.span1),
		this.formatProp("Heal Radius", this.numProp(activate, "healRange"), this.formStyle.span1),
		this.formatProp("Wis Min", this.numProp(activate, "wisMin"), this.formStyle.span1),
		this.formatProp("Wis Per DMG", this.numProp(activate, "wisPerIncrease"), this.formStyle.span1),
		this.formatProp("Wis DMG Base", this.numProp(activate, "wisDamageBase"), this.formStyle.span1),
		this.formatProp("Wis Per DMG Radius", this.numProp(activate, "wisPerRad"), this.formStyle.span1),
		this.formatProp("Wis DMG Radius Base", this.numProp(activate, "incrRad"), this.formStyle.span1),
	]
})