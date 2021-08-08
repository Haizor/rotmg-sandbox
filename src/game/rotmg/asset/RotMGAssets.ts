import Equipment from "../data/Equipment";
import ObjectClass from "../data/ObjectClass";
import XMLObject from "../data/XMLObject";
import { BasicTexture, Texture } from "../data/Texture";
import { SpritesheetManager } from "./atlas/Spritesheet";
import Player from "../data/Player";
import Wall from "../data/Wall";
import Projectile from "../data/Projectile";
import ProjectileRender from "../data/ProjectileRender";

export default class RotMGAssets {
	private _objects: XMLObject[] = [];
	private _objectMaps: Map<ObjectClass, XMLObject[]> = new Map();

	private _processors: Map<string, AssetProcessor> = new Map();

	public spritesheetManager = new SpritesheetManager();

	constructor() {
		this._processors.set("Equipment", this.equipProcessor)
		this._processors.set("Player", this.playerProcessor)
		this._processors.set("Wall", this.wallProccessor)
		this._processors.set("Projectile", this.projectileProcessor);
	}

	async loadAtlases() {
		await this.spritesheetManager.load();
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

	private equipProcessor(xml: any): XMLObject {
		const equip = new Equipment();
		equip.slotType = xml.SlotType;
		equip.tier = xml.Tier !== undefined ? xml.Tier : "UT";

		equip.displayId = xml.DisplayId;
		equip.description = xml.Description;
		equip.rateOfFire = xml.RateOfFire || 1;
		equip.arcGap = xml.ArcGap || 15;
		equip.numProjectiles = xml.NumProjectiles || 1;

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