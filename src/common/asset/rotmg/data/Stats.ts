export class Stats {
	hp: number = 0;
	mp: number = 0;
	atk: number = 0;
	dex: number = 0;
	spd: number = 0;
	def: number = 0;
	vit: number = 0;
	wis: number = 0;

	getAttacksPerSecond() {
		return 1.5 + 6.5 * (this.dex / 75);
	}

	getTilesPerSecond() {
		return 4 + 5.6 * (this.spd / 75);
	}

	add(stats: Stats): Stats {
		const newStats = new Stats();
		newStats.hp = this.hp + stats.hp;
		newStats.mp = this.mp + stats.mp;
		newStats.atk = this.atk + stats.atk;
		newStats.dex = this.dex + stats.dex;
		newStats.spd = this.spd + stats.spd;
		newStats.def = this.def + stats.def;
		newStats.vit = this.vit + stats.vit;
		newStats.wis = this.wis + stats.wis;
		return newStats;
	}

	static min(statsA: Stats, statsB: Stats): Stats {
		const newStats = new Stats();

		newStats.hp = Math.min(statsA.hp, statsB.hp);
		newStats.mp = Math.min(statsA.mp, statsB.mp);
		newStats.atk = Math.min(statsA.atk, statsB.atk);
		newStats.def = Math.min(statsA.def, statsB.def);
		newStats.spd = Math.min(statsA.spd, statsB.spd);
		newStats.dex = Math.min(statsA.dex, statsB.dex);
		newStats.vit = Math.min(statsA.vit, statsB.vit);
		newStats.wis = Math.min(statsA.wis, statsB.wis);

		return newStats;
	}
	
	static fromXML(xml: any) {
		const stats = new Stats();
		const stat = xml["@_stat"];
		const increment = xml["#text"] === "IncrementStat";
		const amount = xml["@_amount"] * (increment ? 1 : -1);
		switch(stat) {
			case "MAXHP":
				stats.hp += amount;
				break;
			case "MAXMP":
				stats.mp += amount;
				break;
			case "ATT":
				stats.atk += amount;
				break;
			case "DEF":
				stats.def += amount;
				break;
			case "SPD":
				stats.spd += amount;
				break;
			case "DEX":
				stats.dex += amount;
				break;
			case "VIT":
				stats.vit += amount;
				break;
			case "WIS":
				stats.wis += amount;
				break;
		}
		return stats;
	}

	static convertStatName(stat: string) {
		switch(stat) {
			case "MAXHP":
				return "hp";
			case "MAXMP":
				return "mp"
			case "ATT":
				return "atk"
			case "DEF":
				return "def"
			case "SPD":
				return "spd"
			case "DEX":
				return "dex"
			case "VIT":
				return "vit"
			case "WIS":
				return "wis";
		}
		return "???"
	}
}