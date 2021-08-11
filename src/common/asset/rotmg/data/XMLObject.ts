
import Serializable from "common/asset/normal/Serializable";
import ObjectClass from "./ObjectClass";
import Projectile from "./Projectile";
import { TextureProvider } from "./Texture";

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

	serialize() {
		return this;
	}
}
