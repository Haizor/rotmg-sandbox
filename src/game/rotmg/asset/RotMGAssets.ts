import Equipment from "../data/Equipment";
import ObjectClass from "../data/ObjectClass";
import XMLObject from "../data/XMLObject";
import Texture from "../data/Texture";
import { SpritesheetManager } from "./atlas/Spritesheet";
import Player from "../data/Player";
import Wall from "../data/Wall";

export default class RotMGAssets {
	private _objects: XMLObject[] = [];
	private _objectMaps: Map<ObjectClass, XMLObject[]> = new Map();

	private _processors: Map<string, AssetProcessor> = new Map();

	public spritesheetManager = new SpritesheetManager();

	constructor() {
		this._processors.set("Equipment", this.equipProcessor)
		this._processors.set("Player", this.playerProcessor)
		this._processors.set("Wall", this.wallProccessor)
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

		equip.bagType = xml.BagType;
		return equip;
	}

	private wallProccessor(xml: any): XMLObject {
		const wall = new Wall();
		wall.top = xml.Top?.Texture !== undefined ? new Texture(xml.Top.Texture.File, xml.Top.Texture.Index, false) : undefined;
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

		const texture = xml.Texture || xml.AnimatedTexture;


		
		obj.texture = texture !== undefined ? new Texture(texture.File, texture.Index, xml.AnimatedTexture !== undefined) : undefined;

		this._objects.push(obj);
		
		if (!this._objectMaps.has(obj.class)) {
			this._objectMaps.set(obj.class, []);
		}

		this._objectMaps.get(obj.class)?.push(obj);

		return obj;
	}
}

type AssetProcessor = (xml: any) => XMLObject