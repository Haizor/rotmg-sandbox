
import Serializable from "common/asset/normal/Serializable";
import ObjectClass from "./ObjectClass";
import Projectile from "./Projectile";
import { TextureProvider } from "./Texture";
import { j2xParser } from "fast-xml-parser";

export default class XMLObject implements Serializable {
	type: number = -1;
	id: string = "";
	class: ObjectClass = ObjectClass.GameObject;
	texture?: TextureProvider;
	projectiles: Projectile[] = [];

	getDisplayName(): string {
		return this.id;
	}

	hasProjectiles(): boolean {
		return this.projectiles.length > 0;
	}

	getSerializedObject() {
		return {
			"@_type": this.type,
			"@_id": this.id,
			Class: this.class,
			...this.texture?.serialize(),
			Projectile: this.serializeProjectiles()
		}
	}

	serialize() {
		const obj = {
			Object: {
				...this.getSerializedObject()
			}
		}
		const parser = new j2xParser({
			attributeNamePrefix: "@_",
			attrNodeName: false,
			ignoreAttributes: false,
		});

		return parser.parse(obj);
	}

	serializeProjectiles() {
		return this.projectiles.map((proj) => proj.serialize());
	}
}
