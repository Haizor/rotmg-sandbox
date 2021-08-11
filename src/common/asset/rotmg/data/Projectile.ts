export interface ConditionEffect {
	duration: number;
	name: string;
}

export type ProjectileParams = {
	objectId: string;
	projectileId?: number;
	speed: number;
	lifetime: number;
	damage?: number;
	minDamage?: number;
	maxDamage?: number;
	amplitude?: number;
	frequency?: number;
	acceleration?: number;
	accelerationDelay?: number;
	speedClamp?: number;
	multiHit?: boolean;
	boomerang?: boolean;
}

export default class Projectile {
	objectId: string;
	projectileId?: number;
	speed: number;
	minDamage?: number;
	maxDamage?: number;
	damage?: number;
	amplitude: number = 0;
	frequency: number = 0;
	acceleration: number = 0;
	accelerationDelay: number = 0;
	speedClamp?: number;
	size: number = 100;
	lifetime: number;
	multiHit: boolean = false;
	boomerang: boolean = false;

	constructor(params: ProjectileParams) {
		this.objectId = params.objectId;
		this.speed = params.speed;
		this.lifetime = params.lifetime;
		this.damage = params.damage;
		this.minDamage = params.minDamage;
		this.maxDamage = params.maxDamage;
		this.amplitude = params.amplitude || 0;
		this.frequency = params.frequency || 0;
		this.acceleration = params.acceleration || 0;
		this.accelerationDelay = params.accelerationDelay || 0;
		this.speedClamp = params.speedClamp;
		this.multiHit = params.multiHit || false;
		this.boomerang = params.boomerang !== undefined ? true : false;
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
			frequency: xml.Frequency,
			acceleration: xml.Acceleration,
			accelerationDelay: xml.AccelerationDelay,
			speedClamp: xml.SpeedClamp,
			multiHit: xml.MultiHit,
			boomerang: xml.Boomerang
		});
		projectile.projectileId = xml["@_id"] || -1;
		projectile.size = xml.Size || 100;

		return projectile;
	}

	//TODO: finish 
	serialize() {
		return {
			ObjectId: this.objectId,
			Speed: this.speed,
			MinDamage: this.minDamage,
			MaxDamage: this.maxDamage,
			LifetimeMS: this.lifetime,
			Amplitude: this.amplitude,
			Frequency: this.frequency,
			Acceleration: this.acceleration,
			AccelerationDelay: this.accelerationDelay,
			SpeedClamp: this.speedClamp,
			"@_id": this.projectileId
		}
	}
}