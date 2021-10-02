import { Data, DataController, deserializeObject, serializeObject } from "common/asset/normal/Serializable";
import Behavior, { behaviorConstructors } from "./Behavior";
import Transition from "./Transition";

export const BehaviorData: DataController<Behavior[]> = {
	serialize: (input: Behavior[]) => {
		return input.map((behavior) => behavior.serialize());
	},
	deserialize: (input: any) => {
		const xml = Array.isArray(input) ? input : [input];
		return xml.reduce((result, val) => {
			if (val === undefined) return result;
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
	serialize: (input: State[]) => {
		return input.map((state) => state.serialize())
	},
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

export const TransitionData: DataController<Transition[]> = {
	serialize: (input: Transition[]) => {
		if (input.length === 0) return;
		return serializeObject(input);
	},
	deserialize: (input: any) => {
		if (input === undefined) return [];
		const xml = Array.isArray(input) ? input: [input];
		return xml.map((val) => {
			const transition = new Transition();
			deserializeObject(transition, val);
			return transition;
		})
	}
}

export default class State {
	@Data("@_id")
	id: string = "";

	@Data("Behavior", BehaviorData)
	behaviors: Behavior[] = []

	@Data("State", StateData)
	states: State[] = [];

	@Data("Transition", TransitionData)
	transitions: Transition[] = [];

	parent?: State;

	getChildWithID(id: string): State | undefined {
		return this.states.find((state) => state.id === id);
	}

	serialize(): any {
		return serializeObject(this);
	}
}