export type DamageSourceOptions = {
	ignoreDef?: boolean | number;
	showDamageNumber?: boolean
	canKill?: boolean;
}

export class DamageSource<T> {
	source: T;
	amount: number;
	ignoreDef: boolean | number = false;
	showDamageNumber: boolean = true;
	canKill: boolean = true;

	constructor(source: T, amount: number, options?: DamageSourceOptions) {
		this.source = source;
		this.amount = amount;
		Object.assign(this, options);
	}
}