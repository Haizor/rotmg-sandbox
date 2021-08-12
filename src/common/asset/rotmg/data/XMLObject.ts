
import Serializable, { SerializationData, Serialize, serializeObject } from "common/asset/normal/Serializable";
import ObjectClass from "./ObjectClass";
import Projectile, { ProjectileSerializer } from "./Projectile";
import { TextureProvider, TextureSerializer } from "./Texture";
import { j2xParser } from "fast-xml-parser";

export default class XMLObject implements Serializable {
	@Serialize("@_type")
	type: number = -1;
	@Serialize("@_id")
	id: string = "";
	@Serialize("Class")
	class: ObjectClass = ObjectClass.GameObject;
	@Serialize("Texture", TextureSerializer, true)
	texture?: TextureProvider;
	@Serialize("Projectile", ProjectileSerializer)
	projectiles: Projectile[] = [];

	readOnly: boolean = false;

	getDisplayName(): string {
		return this.id;
	}

	hasProjectiles(): boolean {
		return this.projectiles.length > 0;
	}

	getSerializedObject(): any {
		return serializeObject(this);
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
