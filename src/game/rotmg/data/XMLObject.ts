import ObjectClass from "./ObjectClass";
import Projectile from "./Projectile";
import Texture from "./Texture";

export default class XMLObject {
	type: number = -1;
	id: string = "";
	class: ObjectClass = ObjectClass.GameObject;
	texture?: Texture;
	projectiles: Projectile[] = [];

	getDisplayName(): string {
		return this.id;
	}

	hasProjectiles(): boolean {
		return this.projectiles.length > 0;
	}
}
