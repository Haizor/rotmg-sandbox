import { Data, deserializeObject } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";

export const activateConstructors = new Map();

export function XMLActivate() {
	return (constructor: Function) => {
		activateConstructors.set(constructor.prototype.getName(), constructor);
	}
}

type AbilityConstructor = new () => {} 

//TODO: scuffed solution
function Proc(Base: AbilityConstructor) {
	return class Proc extends Base {
		cooldown: number = 0;
		proc: number = 1;
		hpRequired?: number;
		hpMinThreshold?: number;
		requiredConditions: StatusEffectType = StatusEffectType.Nothing
		mustNotWear?: number;

		constructor() {
			super()
			Data("@_cooldown")(this, "cooldown")
			Data("@_proc")(this, "proc")
			Data("@_hpRequired")(this, "hpRequired")
			Data("@_hpMinThreshold")(this, "hpMinThreshold")
			Data("@_requiredConditions", StatusEffectTypeData)(this, "requiredConditions")
			Data("@_mustNotWear")(this, "mustNotWear")
		}
	}
}


export default class ActivateParser {
	static fromXML(xml: any, nodeName: string): any | undefined {
		const activateName = xml["#text"] ?? xml;

		let constructor = activateConstructors.get(activateName);
		if (constructor !== undefined) {
			if (nodeName === "OnPlayerAbilityActivate" || nodeName === "OnPlayerHitActivate" || nodeName === "OnPlayerShootActivate") {
				constructor = Proc(constructor);
			}
			const obj = new constructor(xml);


			deserializeObject(obj, xml);
			return obj;
		}

		return;
	}
}