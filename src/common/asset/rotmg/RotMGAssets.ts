import Equipment from "common/asset/rotmg/data/Equipment";
import ObjectClass from "common/asset/rotmg/data/ObjectClass";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import Player from "common/asset/rotmg/data/Player";
import Wall from "common/asset/rotmg/data/Wall";
import ProjectileRender from "common/asset/rotmg/data/ProjectileRender";
import { AssetContainer, Metadata } from "common/asset/normal/AssetContainer";
import { Character } from "./data/Character";
import { j2xParser } from "fast-xml-parser";
import { deserializeObject } from "../normal/Serializable";

export default class RotMGAssets implements AssetContainer<XMLObject> {
	private _objects: XMLObject[] = [];
	private _objectMaps: Map<ObjectClass, XMLObject[]> = new Map();

	private _constructors: Map<ObjectClass, any> = new Map();
	private metadata: Metadata | undefined;

	private readOnly: boolean;

	constructor(readOnly: boolean = false) {
		this.readOnly = readOnly;
		this._constructors.set(ObjectClass.Equipment, Equipment);
		this._constructors.set(ObjectClass.Player, Player);
		this._constructors.set(ObjectClass.Wall, Wall);
		this._constructors.set(ObjectClass.Projectile, ProjectileRender);
		this._constructors.set(ObjectClass.Character, Character);
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

 
	parseFromXML(xml: any): XMLObject | undefined { 
		const clazz = ObjectClass[xml.Class as keyof typeof ObjectClass];
		const constructor = this._constructors.get(clazz);
		const obj: XMLObject = constructor !== undefined ? new constructor() : new XMLObject();
		
		deserializeObject(obj, xml);

		obj.readOnly = this.readOnly;

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