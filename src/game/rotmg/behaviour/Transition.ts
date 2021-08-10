import { State } from "./State";

export default class Transition {
	afterTime: number;
	state: State;

	constructor(state: State, afterTime: number) {
		this.state = state;
		this.afterTime = afterTime;
	}
}