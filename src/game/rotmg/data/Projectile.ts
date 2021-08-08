export interface ConditionEffect {
	duration: number;
	name: string;
}

export type ProjectileParams = {
	objectId: string;
	speed: number;
	lifetime: number;
	damage?: number;
	minDamage?: number;
	maxDamage?: number;
	amplitude?: number;
	frequency?: number;
}

export default class Projectile {
	objectId: string;
	projectileId: number = -1;
	speed: number;
	minDamage?: number;
	maxDamage?: number;
	damage?: number;
	amplitude: number = 0;
	frequency: number = 0;
	size: number = 100;
	lifetime: number;
	multiHit: boolean = false;

	constructor(params: ProjectileParams) {
		this.objectId = params.objectId;
		this.speed = params.speed;
		this.lifetime = params.lifetime;
		this.damage = params.damage;
		this.minDamage = params.minDamage;
		this.maxDamage = params.maxDamage;
		this.amplitude = params.amplitude ?? 0;
		this.frequency = params.frequency ?? 0;
	}

	getDamage(): number {
		if (this.minDamage !== undefined && this.maxDamage !== undefined) {
			return this.minDamage + Math.floor(Math.random() * (this.maxDamage - this.minDamage));
		}
		return this.damage || 0;
	}

	static fromXML(xml: any): Projectile {
		const projectile = new Projectile({
			objectId: xml.ObjectId,
			speed: xml.Speed,
			lifetime: xml.LifetimeMS,
			damage: xml.Damage,
			minDamage: xml.MinDamage,
			maxDamage: xml.MaxDamage,
			amplitude: xml.Amplitude,
			frequency: xml.Frequency
		});
		projectile.projectileId = xml["@_id"] || -1;
		projectile.size = xml.Size || 100;
		projectile.multiHit = xml.MultiHit !== undefined;
		return projectile;
	}
}