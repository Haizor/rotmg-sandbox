export class DamageSource<T> {
	source: T;
	amount: number;
	ignoreDef: boolean = false;

	constructor(source: T, amount: number, ignoreDef?: boolean) {
		this.source = source;
		this.amount = amount;
		this.ignoreDef = ignoreDef ?? false;
	}
}