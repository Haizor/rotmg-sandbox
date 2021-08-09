import Equipment from "common/asset/rotmg/data/Equipment";
import ObjectClass from "common/asset/rotmg/data/ObjectClass";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import { BasicTexture } from "common/asset/rotmg/data/Texture";
import Player from "common/asset/rotmg/data/Player";
import Wall from "common/asset/rotmg/data/Wall";
import Projectile from "common/asset/rotmg/data/Projectile";
import ProjectileRender from "common/asset/rotmg/data/ProjectileRender";
import { AssetContainer } from "common/asset/normal/AssetContainer";
import { Stats } from "common/asset/rotmg/data/Stats";
import Activate from "common/asset/rotmg/data/activate/Activate";

type GetOptions = string | {
	type: number
}

export default class RotMGAssets implements AssetContainer<XMLObject> {
	private _objects: XMLObject[] = [];
	private _objectMaps: Map<ObjectClass, XMLObject[]> = new Map();

	private _processors: Map<string, AssetProcessor> = new Map();

	constructor() {
		this._processors.set("Equipment", this.equipProcessor)
		this._processors.set("Player", this.playerProcessor)
		this._processors.set("Wall", this.wallProccessor)
		this._processors.set("Projectile", this.projectileProcessor);
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

		if (xml.ActivateOnEquip) {
			const statBoosts = Array.isArray(xml.ActivateOnEquip) ? xml.ActivateOnEquip : [xml.ActivateOnEquip];
			for (const statBoost of statBoosts) {
				equip.stats = equip.stats.add(Stats.fromXML(statBoost));
			}
		}

		if (xml.Activate) {
			const activates = Array.isArray(xml.Activate) ? xml.Activate : [xml.Activate];
			equip.activates = activates.map((xml: any) => Activate.fromXML(xml));
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
 
	parseFromXML(xml: any): XMLObject | undefined {
		const processor = this._processors.get(xml.Class);
		const obj: XMLObject = processor !== undefined ? processor(xml) : new XMLObject();
		obj.class = xml.Class;
		obj.type = xml["@_type"];
		obj.id = xml["@_id"];

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
}

type AssetProcessor = (xml: any) => XMLObject