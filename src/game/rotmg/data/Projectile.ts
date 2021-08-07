export interface ConditionEffect {
	duration: number;
	name: string;
}

export type ProjectileParams = {
	objectId: string;
	speed: number;
	damage: number;
	lifetime: number;
}

export default class Projectile {
	objectId: string;
	projectileId: number = -1;
	speed: number;
	damage: number;
	size: number = 100;
	lifetime: number;
	multiHit: boolean = false;

	constructor(params: ProjectileParams) {
		this.objectId = params.objectId;
		this.speed = params.speed;
		this.damage = params.damage;
		this.lifetime = params.lifetime;
	}

	static fromXML(xml: any): Projectile {
		const projectile = new Projectile({
			objectId: xml.ObjectId,
			speed: xml.Speed,
			damage: xml.Damage,
			lifetime: xml.Lifetime
		});
		projectile.projectileId = xml["@_id"] || -1;
		projectile.size = xml.Size || 100;
		projectile.multiHit = xml.MultiHit !== undefined;
		return projectile;
	}
}