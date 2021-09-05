import Equipment from "common/asset/rotmg/data/Equipment";
import ObjectClass from "common/asset/rotmg/data/ObjectClass";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import { BasicTexture } from "common/asset/rotmg/data/Texture";
import Player from "common/asset/rotmg/data/Player";
import Wall from "common/asset/rotmg/data/Wall";
import Projectile from "common/asset/rotmg/data/Projectile";
import ProjectileRender from "common/asset/rotmg/data/ProjectileRender";
import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { Stats } from "common/asset/rotmg/data/Stats";
import { Character } from "./data/Character";
import { j2xParser } from "fast-xml-parser";
import ActivateParser from "./data/activate/ActivateParser";

export default class RotMGAssets implements AssetContainer<XMLObject> {
	private _objects: XMLObject[] = [];
	private _objectMaps: Map<ObjectClass, XMLObject[]> = new Map();

	private _processors: Map<ObjectClass, AssetProcessor> = new Map();
	private metadata: Metadata | undefined;

	private readOnly: boolean;

	constructor(readOnly: boolean = false) {
		this.readOnly = readOnly;
		this._processors.set(ObjectClass.Equipment, this.equipProcessor)
		this._processors.set(ObjectClass.Player, this.playerProcessor)
		this._processors.set(ObjectClass.Wall, this.wallProccessor)
		this._processors.set(ObjectClass.Projectile, this.projectileProcessor);
		this._processors.set(ObjectClass.Character, this.characterProcessor);
	}

	add(obj: XMLObject) {
		if (this.readOnly) return;

		if (!this._objectMaps.has(obj.class)) {
			this._objectMaps.set(obj.class, []);
		}

		const categorized = this._objectMaps.get(obj.class) as XMLObject[];

		const index = this._objects.findIndex((o) => o.id === obj.id);
		if (index !== -1) {
			this._objects[index] = obj;
			categorized[categorized.findIndex((o) => o.id === obj.id)] = obj;
			return;
		}

		this._objects.push(obj);
		this._objectMaps.get(obj.class)?.push(obj);
	}

	getMetadata(): Metadata | undefined {
		return this.metadata;
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}

	get(id: any): XMLObject | undefined {
		if (typeof(id) === "string") {
			return this.getObjectFromId(id);
		} else if (typeof(id) === "number") {
			return this.getObjectFromType(id);
		}
		return this.getObjectFromId(id);
	}

	getAll(): XMLObject[] {
		return this._objects;
	}

	getObjects(): XMLObject[] {
		return this._objects;
	}

	getObjectsOfClass(clazz: ObjectClass) {
		return this._objectMaps.get(clazz);
	}

	getObjectFromId(id: string) {
		return this._objects.find((obj) => obj.id === id);
	}

	getObjectFromType(type: number) {
		return this._objects.find((obj) => obj.type === type);
	}

	private equipProcessor(xml: any): XMLObject {
		const equip = new Equipment();
		equip.slotType = xml.SlotType;
		equip.tier = xml.Tier !== undefined ? xml.Tier : "UT";

		equip.displayId = xml.DisplayId;
		equip.description = xml.Description;
		equip.rateOfFire = xml.RateOfFire || 1;
		equip.arcGap = xml.ArcGap ?? 15;
		equip.numProjectiles = xml.NumProjectiles || 1;

		equip.consumable = xml.Consumable !== undefined;
		equip.soulbound = xml.Soulbound;
		equip.potion = xml.Potion;
		equip.feedPower = xml.feedPower;

		equip.mpCost = xml.MpCost || 0;
		equip.cooldown = xml.Cooldown || 0.5;
		equip.xpBonus = xml.XPBonus;

		if (xml.ActivateOnEquip) {
			const statBoosts = Array.isArray(xml.ActivateOnEquip) ? xml.ActivateOnEquip : [xml.ActivateOnEquip];
			for (const statBoost of statBoosts) {
				equip.stats = equip.stats.add(Stats.fromXML(statBoost));
			}
		}

		if (xml.Activate) {
			const activates = Array.isArray(xml.Activate) ? xml.Activate : [xml.Activate];
			equip.activates = activates.map((xml: any) => ActivateParser.fromXML(xml));
		}

		if (xml.ExtraTooltipData) {
			const infos = Array.isArray(xml.ExtraTooltipData.EffectInfo) ? xml.ExtraTooltipData.EffectInfo : [xml.ExtraTooltipData.EffectInfo];
			equip.extraTooltipData = infos.map((info: any) => {
				return {
					name: info["@_name"],
					description: info["@_description"]
				}
			})
		}

		equip.bagType = xml.BagType;
		return equip;
	}

	private projectileProcessor(xml: any): XMLObject {
		const proj = new ProjectileRender();
		proj.angleCorrection = xml.AngleCorrection || 0;
		proj.rotation = xml.Rotation || 0;
		return proj;
	}

	private wallProccessor(xml: any): XMLObject {
		const wall = new Wall();
		wall.top = BasicTexture.fromXML(xml.Top);
		return wall;
	}

	private playerProcessor(xml: any): XMLObject {
		const player = new Player();
		player.description = xml.Description;
		player.slotTypes = xml.SlotTypes.split(", ").map((num: string) => parseInt(num));
		player.equipment = xml.Equipment.split(", ").map((num: string) => parseInt(num));

		const stats = new Stats();
		stats.hp = xml.MaxHitPoints["#text"];
		stats.mp = xml.MaxMagicPoints["#text"];
		stats.atk = xml.Attack["#text"];
		stats.def = xml.Defense["#text"];
		stats.spd = xml.Speed["#text"];
		stats.dex = xml.Dexterity["#text"];
		stats.vit = xml.HpRegen["#text"];
		stats.wis = xml.MpRegen["#text"];
		player.stats = stats;

		const maxStats = new Stats();
		maxStats.hp = xml.MaxHitPoints["@_max"];
		maxStats.mp = xml.MaxMagicPoints["@_max"];
		maxStats.atk = xml.Attack["@_max"];
		maxStats.def = xml.Defense["@_max"];
		maxStats.spd = xml.Speed["@_max"];
		maxStats.dex = xml.Dexterity["@_max"];
		maxStats.vit = xml.HpRegen["@_max"];
		maxStats.wis = xml.MpRegen["@_max"];
		player.maxStats = maxStats;

		return player;
	}

	private characterProcessor(xml: any): XMLObject {
		const character = new Character();
		character.maxHp = xml.MaxHitPoints;
		character.defense = xml.Defense;
		return character;
	}
 
	parseFromXML(xml: any): XMLObject | undefined { 
		const clazz = ObjectClass[xml.Class as keyof typeof ObjectClass];
		const processor = this._processors.get(clazz);
		const obj: XMLObject = processor !== undefined ? processor(xml) : new XMLObject();
		obj.class = clazz;
		obj.type = xml["@_type"];
		obj.id = xml["@_id"];
		obj.readOnly = this.readOnly;

		obj.texture = BasicTexture.fromXML(xml);

		if (xml.Projectile !== undefined) {
			const projectiles = Array.isArray(xml.Projectile) ? xml.Projectile : [xml.Projectile];
			for (const projXML of projectiles) {
				const projectile = Projectile.fromXML(projXML);
				obj.projectiles.push(projectile);
			}
		}
		this._objects.push(obj);
		
		if (!this._objectMaps.has(obj.class)) {
			this._objectMaps.set(obj.class, []);
		}

		this._objectMaps.get(obj.class)?.push(obj);

		return obj;
	}

	serialize() {
		const obj = {
			Objects: {
				Object: this.getAll().map((v) => v.getSerializedObject())
			}
		}
		
		const parser = new j2xParser({
			attributeNamePrefix: "@_",
			attrNodeName: false,
			ignoreAttributes: false,
		});

		return parser.parse(obj);
	}
}

type AssetProcessor = (xml: any) => XMLObject