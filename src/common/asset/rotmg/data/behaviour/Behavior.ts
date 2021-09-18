import Serializable, { Data } from "common/asset/normal/Serializable";

type BehaviorConstructor = new () => Behavior; 

export const behaviorConstructors: Map<string, BehaviorConstructor> = new Map();

@XMLBehavior()
export default class Behavior implements Serializable {
	@Data("@_bucket")
	bucket?: string;
	@Data("@_cooldown")
	cooldown?: number;

	serialize(): string {
		return ""
	}
}

export function XMLBehavior() {
	return (constructor: BehaviorConstructor) => {
		behaviorConstructors.set(constructor.name, constructor);
	}
}