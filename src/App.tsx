import React from 'react';
import "./App.css"

import { assetManager, config, playerManager } from './Assets';
import LoadingScreen from './components/LoadingScreen';
import InventoryDisplay from './components/rotmg/InventoryDisplay';
import Canvas from './components/Canvas';
import Equipment from './common/asset/rotmg/data/Equipment';
import Player from './common/asset/rotmg/data/Player';
import Bar from 'components/rotmg/Bar';
import Popup from 'components/Popup';
import GiveItemMenu from 'components/rotmg/GiveItemMenu';
import AssetManagerViewer from 'components/asset/AssetManagerViewer';

export default class App extends React.Component<{}, {loaded: boolean}> {
	constructor(props: {}) {
		super(props);
		this.state = { loaded: false }
	}

	componentDidMount() {
		assetManager.load(config).then(() => {
			this.setState({loaded: true});
			playerManager.inventory.setItem(8, assetManager.get<Equipment>("rotmg", "Bracer of the Guardian")?.value.createInstance());
			playerManager.inventory.setItem(9, assetManager.get<Equipment>("rotmg", "Apple")?.value.createInstance());
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
					<Popup 
						button={<button>TEST</button>}
					>
						<AssetManagerViewer assetManager={assetManager}/>
					</Popup>
					<Popup 
						button={<button>TEST2</button>}
					>
						<GiveItemMenu assetManager={assetManager} />
					</Popup>
					<Canvas />

				</div>

				<div className="playerInventory">
					<Bar valueProvider={{eventName: "hp", provider: playerManager}}/>
					<Bar valueProvider={{eventName: "mp", provider: playerManager}} color={"#0000ff"}/>
					<InventoryDisplay inventory={playerManager.inventory} slotsPerRow={4} displayCount={12} />
				</div>


			</div>
		)
	}
}