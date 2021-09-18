import { AssetContainer, Metadata } from "../normal/AssetContainer";
import { deserializeObject } from "../normal/Serializable";
import State from "./data/behaviour/State";

export default class RotMGStates implements AssetContainer<State> {
	metadata?: Metadata;
	states: State[] = []

	get(id: any): State | undefined {
		return this.states.find((state) => state.id === id);
	}

	getAll(): State[] {
		return this.states;
	}

	parseFromXML(xml: any) {
		const state = new State();
		deserializeObject(state, xml)
		this.states.push(state);
	}

	getMetadata(): Metadata | undefined {
		return this.metadata;
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}
}