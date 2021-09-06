
import Serializable, { Data, serializeObject, XMLEnum } from "common/asset/normal/Serializable";
import ObjectClass from "./ObjectClass";
import Projectile, { ProjectileData } from "./Projectile";
import { TextureProvider, TextureData } from "./Texture";
import { j2xParser } from "fast-xml-parser";

export default class XMLObject implements Serializable {
	@Data("@_type")
	type: number = -1;
	@Data("@_id")
	id: string = "";
	@Data("Class", XMLEnum(ObjectClass))
	class: ObjectClass = ObjectClass.GameObject;
	@Data("Texture", TextureData, {isConstructed: true})
	texture?: TextureProvider;
	@Data("Projectile", ProjectileData)
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
