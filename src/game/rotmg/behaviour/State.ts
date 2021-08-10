import Behavior from "./Behavior";
import Transition from "./Transition";

export class State {
	parent?: State;
	transition?: Transition
	id: string;
	states: State[] = [];
	behaviours: Behavior[] = [];
	constructor(id: string) {
		this.id = id;
	}

	addBehavior(behavior: Behavior) {
		this.behaviours.push(behavior);
	}

	addState(state: State) {
		this.states.push(state);
		state.parent = this;
	}

	setTransition(transition: Transition) {
		this.transition = transition;
		this.transition.parent = this;
	}

	getAllBehaviors(): Behavior[] {
		if (this.parent !== undefined) {
			return [...this.behaviours, ...this.parent.getAllBehaviors()]
		}
		return this.behaviours;
	}

	getAllTransitions(): Transition[] {
		let transitions: Transition[] = [];
		if (this.transition !== undefined) {
			transitions = [this.transition];
		}
		if (this.parent !== undefined) {
			return [...transitions, ...this.parent.getAllTransitions()]
		}
		return transitions;
	}

	getState(id: string) {
		return this.states.find((state) => state.id === id);
	}
}