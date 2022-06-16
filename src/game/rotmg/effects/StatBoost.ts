import { StatType, Stats, TextureProvider, BasicTexture } from "@haizor/rotmg-utils";

const IndexMapper = {
	"MAXHP": 32,
	"MAXMP": 33,
	"ATT": 34,
	"DEF": 35,
	"SPD": 36,
	"DEX": 37,
	"VIT": 38,
	"WIS": 39
}

export default class StatBoost {
	stat: StatType;
	duration: number;
	amount: number;
	time: number = 0;

	fullStats: Stats;

	constructor(stat: StatType, duration: number, amount: number) {
		this.stat = stat;
		this.duration = duration;
		this.amount = amount;

		this.fullStats = new Stats();
		this.fullStats[Stats.convertStatName(stat) ?? "hp"] = amount;
	}

	getTexture(): TextureProvider {
		const index = IndexMapper[this.stat] + (this.amount < 0 ? 16 : 0);
		return new BasicTexture("lofiInterfaceBig", index, false);
	}
}