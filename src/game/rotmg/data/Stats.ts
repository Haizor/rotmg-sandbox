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
}