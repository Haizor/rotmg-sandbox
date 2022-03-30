import { DataController, Data, serializeObject, XMLNoDefault, deserializeObject, XMLBoolean } from "common/asset/normal/Serializable";
import StatusEffectType from "./StatusEffectType";

export default class Projectile {
	@Data("ObjectId")
	objectId: string = "null";
	@Data("@_id", XMLNoDefault(-1))
	projectileId?: number;
	@Data("Speed")
	speed: number = 0;
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
	lifetime: number = -1;
	@Data("MultiHit", XMLBoolean)
	multiHit: boolean = false;
	@Data("Boomerang", XMLBoolean)
	boomerang: boolean = false;
	@Data("ArmorPiercing", XMLBoolean)
	armorPiercing: boolean = false;
	@Data("PassesCover", XMLBoolean)
	passesCover: boolean = false;
	@Data("Wavy", XMLBoolean)
	wavy: boolean = false;
	@Data("Parametric", XMLBoolean)
	parametric: boolean = false;
	@Data("CircleTurnDelay")
	circleTurnDelay?: number;
	@Data("CircleTurnAngle")
	circleTurnAngle?: number;
	//TODO: reimplement this
	conditionEffect?: ConditionEffect

	getDamage(): number {
		if (this.minDamage !== undefined && this.maxDamage !== undefined) {
			return this.minDamage + Math.floor(Math.random() * (this.maxDamage - this.minDamage));
		}
		return this.damage || 0;
	}

	getRange(): number {
		return (this.lifetime * this.speed) / 10000
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

		return projectiles.map((v) => {
			let proj = new Projectile();
			deserializeObject(proj, v);
			return proj;
		})
	}
}

export function ProjectileSerializer(proj: Projectile[]) {
	return proj.map((proj) => proj.serialize())
}