import { DataController, Data, serializeObject, XMLNoDefault } from "common/asset/normal/Serializable";
import StatusEffectType from "./StatusEffectType";

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
	passesCover?: boolean;
	wavy?: boolean;
	parametric?: boolean;
}

//TODO: rewrite this entire class jesus fuck this is not ok
export default class Projectile {
	@Data("ObjectId")
	objectId: string;
	@Data("@_id", XMLNoDefault(-1))
	projectileId?: number;
	@Data("Speed")
	speed: number;
	@Data("MinDamage")
	minDamage?: number;
	@Data("MaxDamage")
	maxDamage?: number;
	@Data("Damage")
	damage?: number;
	@Data("Amplitude", XMLNoDefault(0))
	amplitude: number = 0;
	@Data("Frequency", XMLNoDefault(0))
	frequency: number = 0;
	@Data("Acceleration", XMLNoDefault(0))
	acceleration: number = 0;
	@Data("AccelerationDelay", XMLNoDefault(0))
	accelerationDelay: number = 0;
	@Data("SpeedClamp")
	speedClamp?: number;
	@Data("Size", XMLNoDefault(100))
	size: number = 100;
	@Data("LifetimeMS")
	lifetime: number;
	@Data("MultiHit", XMLNoDefault(false))
	multiHit: boolean = false;
	@Data("Boomerang", XMLNoDefault(false))
	boomerang: boolean = false;
	@Data("ArmorPiercing", XMLNoDefault(false))
	armorPiercing: boolean = false;
	@Data("PassesCover", XMLNoDefault(false))
	passesCover: boolean = false;
	@Data("Wavy", XMLNoDefault(false))
	wavy: boolean = false;
	@Data("Parametric", XMLNoDefault(false))
	parametric: boolean = false;

	conditionEffect?: ConditionEffect

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
		this.multiHit = params.multiHit !== undefined ? true : false;
		this.boomerang = params.boomerang !== undefined ? true : false;
		this.armorPiercing = params.armorPiercing !== undefined ? true : false;
		this.passesCover = params.passesCover !== undefined ? true : false;
		this.wavy = params.wavy !== undefined ? true : false;
		this.parametric = params.parametric !== undefined ? true : false;
	}

	getDamage(): number {
		if (this.minDamage !== undefined && this.maxDamage !== undefined) {
			return this.minDamage + Math.floor(Math.random() * (this.maxDamage - this.minDamage));
		}
		return this.damage || 0;
	}

	getRange(): number {
		return (this.lifetime * this.speed) / 10000
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
			armorPiercing: xml.ArmorPiercing,
			passesCover: xml.PassesCover,
			wavy: xml.Wavy,
			parametric: xml.Parametric
		});
		projectile.projectileId = xml["@_id"] || -1;
		projectile.size = xml.Size || 100;
		if (xml.ConditionEffect !== undefined) {
			projectile.conditionEffect = {
				type: StatusEffectType[xml.ConditionEffect["#text"] as keyof typeof StatusEffectType],
				duration: xml.ConditionEffect["@_duration"]
			}
		}

		return projectile;
	}

	//TODO: finish 
	serialize(): any {
		return serializeObject(this);
	}
}

export interface ConditionEffect {
	type: StatusEffectType
	duration: number
}

export const ProjectileData: DataController<Projectile[]> = {
	serialize: (value) => value.map((proj) => proj.serialize()),
	deserialize: (value) => {
		if (value === undefined) return [];
		let projectiles = Array.isArray(value) ? value : [value];
		
		return projectiles.map((proj) => Projectile.fromXML(proj));
	}
}

export function ProjectileSerializer(proj: Projectile[]) {
	return proj.map((proj) => proj.serialize())
}