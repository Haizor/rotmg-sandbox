
import { Stats } from "../Stats";
import StatusEffectType from "../StatusEffectType";
import Activate from "./Activate";
import BulletNova from "./BulletNova";
import ConditionEffectAura from "./ConditionEffectAura";
import IncrementStat from "./IncrementStat";

const test = StatusEffectType["Damaging"]

export default class ActivateParser {
	static fromXML(xml: any): Activate | undefined {
		const activateName = xml["#text"] ?? xml;
		switch(activateName) {
			case "IncrementStat":
				return new IncrementStat(Stats.fromXML(xml))
			case "BulletNova":
				return new BulletNova(xml["@_numShots"]);
			case "ConditionEffectAura":
				return new ConditionEffectAura(StatusEffectType[xml["@_effect"] as keyof typeof StatusEffectType], xml["@_duration"], xml["@_range"]);
		}
		return;
	}
}