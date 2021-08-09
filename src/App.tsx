import React from 'react';
import "./App.css"

import { assetManager, config } from './Assets';
import { Slot } from './common/Inventory';
import LoadingScreen from './components/LoadingScreen';
import EquipSlot from './components/rotmg/EquipSlot';
import Equipment, { SlotType } from './game/rotmg/data/Equipment';

export default class App extends React.Component<{}, {loaded: boolean}> {
	constructor(props: {}) {
		super(props);
		this.state = { loaded: false }
	}

	componentDidMount() {
		assetManager.load(config).then(() => {
			this.setState({loaded: true});
		})
	}

	render() {
		if (!this.state.loaded) {
			return <LoadingScreen />
		}

		return (
			<div className="app">
				<EquipSlot defaultEquip={assetManager.get<Equipment>("rotmg", "Staff of Esben")?.value} slot={new Slot()}/>
				<EquipSlot defaultEquip={assetManager.get<Equipment>("rotmg", "Bow of Fey Magic")?.value} slot={new Slot()}/>
				<EquipSlot slot={new Slot()}/>
				<EquipSlot slot={new Slot()}/>
				<EquipSlot slot={new Slot()}/>
				<EquipSlot slot={new Slot()}/>
				<EquipSlot slot={new Slot(SlotType.Bow)}/>
			</div>
		)
	}
}