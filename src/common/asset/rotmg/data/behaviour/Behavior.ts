import { Data, serializeObject } from "common/asset/normal/Serializable";

type BehaviorConstructor = new () => Behavior; 

export const behaviorConstructors: Map<string, BehaviorConstructor> = new Map();

export default abstract class Behavior {
	@Data("@_bucket")
	bucket?: string;
	@Data("@_cooldown")
	cooldown?: number;

	abstract get name(): string;

	serialize(): any {
		const obj = serializeObject(this);
		obj["#text"] = this.name;
		return obj;
	}
}

export function XMLBehavior() {
	return (constructor: BehaviorConstructor) => {
		behaviorConstructors.set(constructor.prototype.name, constructor);
	}
}