import React from 'react';
import styles from "./App.module.css"

import { assetManager, config, db, loading, playerManager } from './Assets';
import LoadingScreen from './components/LoadingScreen';
import InventoryDisplay from './components/rotmg/InventoryDisplay';
import Canvas from './components/Canvas';
import Equipment from './common/asset/rotmg/data/Equipment';
import Player from './common/asset/rotmg/data/Player';
import Bar from 'components/rotmg/Bar';
import GiveItemMenu from 'components/rotmg/GiveItemMenu';
import AssetManagerViewer from 'components/asset/AssetManagerViewer';
import PopupManager from 'PopupManager';
import PopupRenderer from 'components/PopupRenderer';
import SpritePicker from 'components/rotmg/SpritePicker';

type State = {
	loaded: boolean;
}

export default class App extends React.Component<{}, State> {
	constructor(props: {}) {
		super(props);
		this.state = { loaded: false }
	}

	componentDidMount() {
		loading.then(() => {
			this.setState({loaded: true});
			playerManager.inventory.setItem(8, assetManager.get<Equipment>("rotmg", "Bracer of the Guardian")?.value.createInstance());
			playerManager.inventory.setItem(9, assetManager.get<Equipment>("rotmg", "Apple")?.value.createInstance());
			playerManager.inventory.setItem(10, assetManager.get<Equipment>("rotmg", "Tablet of the King's Avatar")?.value.createInstance());
			playerManager.setClass(assetManager.get<Player>("rotmg", "Wizard")?.value);
		});
	}


	render() {
		if (!this.state.loaded) {
			return <LoadingScreen />
		}

		return (
			<div className={styles.app}>
				<div id="hoverPortal">
					<PopupRenderer manager={PopupManager} />
				</div>
				<div className={styles.main}>
					<div className={styles.topBar}>
						<button onClick={() => PopupManager.popup("assetView", <AssetManagerViewer assetManager={assetManager}  db={db}/>)}>View Assets</button>
						<button onClick={() => PopupManager.popup("itemGive", <GiveItemMenu assetManager={assetManager} />)}>Give Items</button>
					</div>
					
					<Canvas />

				</div>

				<div className={styles.playerInventory}>
					<Bar valueProvider={{eventName: "hp", provider: playerManager}}/>
					<Bar valueProvider={{eventName: "mp", provider: playerManager}} color={"#0000ff"}/>
					<InventoryDisplay inventory={playerManager.inventory} slotsPerRow={4} displayCount={12} />
				</div>


			</div>
		)
	}
}