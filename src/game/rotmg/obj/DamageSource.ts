export type DamageSourceOptions = {
	ignoreDef?: boolean
	showDamageNumber?: boolean
	canKill?: boolean;
}

export class DamageSource<T> {
	source: T;
	amount: number;
	ignoreDef: boolean = false;
	showDamageNumber: boolean = true;
	canKill: boolean = true;

	constructor(source: T, amount: number, options: DamageSourceOptions) {
		this.source = source;
		this.amount = amount;
		Object.assign(this, options);
	}
}