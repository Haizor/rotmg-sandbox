import React from 'react';
import "./App.css"

import { assetManager, config, playerManager } from './Assets';
import { Slot } from './common/Inventory';
import LoadingScreen from './components/LoadingScreen';
import EquipSlot from './components/rotmg/EquipSlot';
import InventoryDisplay from './components/rotmg/InventoryDisplay';
import Canvas from './components/Canvas';
import Equipment, { SlotType } from './common/asset/rotmg/data/Equipment';
import Player from './common/asset/rotmg/data/Player';
import XMLObject from './common/asset/rotmg/data/XMLObject';

export default class App extends React.Component<{}, {loaded: boolean}> {
	constructor(props: {}) {
		super(props);
		this.state = { loaded: false }
	}

	componentDidMount() {
		assetManager.load(config).then(() => {
			this.setState({loaded: true});
			playerManager.inventory.setItem(8, assetManager.get<Equipment>("rotmg", "Candy Ring")?.value.createInstance());
			playerManager.inventory.setItem(9, assetManager.get<Equipment>("rotmg", "Greater Potion of Speed")?.value.createInstance());
			playerManager.inventory.setItem(10, assetManager.get<Equipment>("rotmg", "Tablet of the King's Avatar")?.value.createInstance());
			playerManager.setClass(assetManager.get<Player>("rotmg", "Wizard")?.value);
		})
	}

	render() {
		if (!this.state.loaded) {
			return <LoadingScreen />
		}

		return (
			<div className="app">
				<div id="hoverPortal">
				
				</div>
				<div className="main">
					<Canvas />
				</div>

				<div className="playerInventory">
					<InventoryDisplay inventory={playerManager.inventory} slotsPerRow={4} displayCount={12} />
				</div>
			</div>
		)
	}
}