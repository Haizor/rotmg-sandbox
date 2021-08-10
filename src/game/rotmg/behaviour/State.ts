import Behavior from "./Behavior";
import Transition from "./Transition";

export class State {
	transition?: Transition
	states: State[] = [];
	behaviours: Behavior[] = [];
}