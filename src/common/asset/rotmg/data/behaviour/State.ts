import Serializable, { Data, DataController, deserializeObject } from "common/asset/normal/Serializable";
import Behavior, { behaviorConstructors } from "./Behavior";
import Transition from "./Transition";

export const BehaviorData: DataController<Behavior[]> = {
	serialize: (input: Behavior[]) => "",
	deserialize: (input: any) => {
		const xml = Array.isArray(input) ? input : [input];
		return xml.reduce((result, val) => {
			const constructor = behaviorConstructors.get(val["#text"]);
			if (constructor === undefined) return result;
			const obj = new constructor();
			deserializeObject(obj, val);
			result.push(obj);
			return result;
		}, [])
	}
}

export const StateData: DataController<State[]> = {
	serialize: (input: State[]) => "",
	deserialize: function(this: State, input: any) {
		if (input === undefined) return [];
		const xml = Array.isArray(input) ? input : [input];
		return xml.map((val) => {

			const state = new State();
			deserializeObject(state, val);
			state.parent = this;
			return state;
		})
	}
}

export const TransitionData: DataController<Transition | undefined> = {
	serialize: (input: Transition | undefined) => "",
	deserialize: (input: any) => {
		if (input === undefined) return undefined;
		const transition = new Transition();
		deserializeObject(transition, input);
		return transition;
	}
}

export default class State implements Serializable {
	@Data("@_id")
	id: string = "";

	@Data("Behavior", BehaviorData)
	behaviors: Behavior[] = []

	@Data("State", StateData)
	states: State[] = [];

	@Data("Transition", TransitionData)
	transition?: Transition;

	parent?: State;

	getChildWithID(id: string): State | undefined {
		return this.states.find((state) => state.id === id);
	}

	serialize(): string {
		return ""
	}
}