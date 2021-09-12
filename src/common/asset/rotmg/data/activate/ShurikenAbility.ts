import { Data, XMLBoolean } from "common/asset/normal/Serializable";
import StatusEffectType, { StatusEffectTypeData } from "../StatusEffectType";
import Activate from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export default class ShurikenAbility implements Activate {
	@Data("@_effect", StatusEffectTypeData)
	effect: StatusEffectType = StatusEffectType.Speedy;
	@Data("@_enablePetManaHealing", XMLBoolean)
	enablePetManaHealing: boolean = true;
	@Data("@_enableManaRegen")
	enableManaRegen: boolean = false;
	@Data("@_enableGenericManaHealing", XMLBoolean)
	enableGenericManaHealing: boolean = true;

	getName(): string {
		return "ShurikenAbility"
	}
}