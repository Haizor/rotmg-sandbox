import { Serialize, serializeObject, XMLNoDefault } from "common/asset/normal/Serializable";

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
	armorPiercing?: boolean;
}

export default class Projectile {
	@Serialize("ObjectId")
	objectId: string;
	@Serialize("@_id", XMLNoDefault(-1))
	projectileId?: number;
	@Serialize("Speed")
	speed: number;
	@Serialize("MinDamage")
	minDamage?: number;
	@Serialize("MaxDamage")
	maxDamage?: number;
	@Serialize("Damage")
	damage?: number;
	@Serialize("Amplitude", XMLNoDefault(0))
	amplitude: number = 0;
	@Serialize("Frequency", XMLNoDefault(0))
	frequency: number = 0;
	@Serialize("Acceleration", XMLNoDefault(0))
	acceleration: number = 0;
	@Serialize("AccelerationDelay", XMLNoDefault(0))
	accelerationDelay: number = 0;
	@Serialize("SpeedClamp")
	speedClamp?: number;
	@Serialize("Size", XMLNoDefault(100))
	size: number = 100;
	@Serialize("LifetimeMS")
	lifetime: number;
	@Serialize("MultiHit", XMLNoDefault(false))
	multiHit: boolean = false;
	@Serialize("Boomerang", XMLNoDefault(false))
	boomerang: boolean = false;
	@Serialize("ArmorPiercing", XMLNoDefault(false))
	armorPiercing: boolean = false;

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
		this.armorPiercing = params.armorPiercing !== undefined ? true : false;
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
			boomerang: xml.Boomerang,
			armorPiercing: xml.ArmorPiercing
		});
		projectile.projectileId = xml["@_id"] || -1;
		projectile.size = xml.Size || 100;

		return projectile;
	}

	//TODO: finish 
	serialize(): any {
		return serializeObject(this);
	}
}

export function ProjectileSerializer(proj: Projectile[]) {
	return proj.map((proj) => proj.serialize())
}