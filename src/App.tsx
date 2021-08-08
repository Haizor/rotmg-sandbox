import React from 'react';
import "./App.css"

import { assetManager, config } from './Assets';
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
				<EquipSlot defaultEquip={assetManager.get<Equipment>("rotmg", "Staff of Esben")?.value}/>
				<EquipSlot />
				<EquipSlot />
				<EquipSlot defaultEquip={assetManager.get<Equipment>("rotmg", "Bow of Fey Magic")?.value}/>
				<EquipSlot />
				<EquipSlot />
				<EquipSlot />
				<EquipSlot slotType={SlotType.Bow}/>
			</div>
		)
	}
}