import { Stats } from "../Stats";

export default class IncrementStat {
	stats: Stats
	constructor(stats: Stats) {
		this.stats = stats;
	}
}