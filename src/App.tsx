import AssetManagerViewer from 'components/asset/AssetManagerViewer';
import PopupRenderer from 'components/PopupRenderer';
import Bar from 'components/rotmg/Bar';
import ChangeClass from 'components/rotmg/ChangeClass';
import GiveItemMenu from 'components/rotmg/GiveItemMenu';
import PopupManager from 'PopupManager';
import React from 'react';
import styles from "./App.module.css";
import { assetManager, db, loading, playerManager } from './Assets';
import Equipment from './common/asset/rotmg/data/Equipment';
import Player from './common/asset/rotmg/data/Player';
import Canvas from './components/Canvas';
import LoadingScreen from './components/LoadingScreen';
import InventoryDisplay from './components/rotmg/InventoryDisplay';


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
						<button onClick={() => PopupManager.popup("changeClass", <ChangeClass assetManager={assetManager} playerManager={playerManager}/>)}>Change Class</button>
					</div>
					
					<Canvas />

				</div>

				<div className={styles.playerInventory}>
					<Bar 
						valueProvider={{eventName: "hp", provider: playerManager}} 
						borderColorProvider={{eventName: "combatColor", provider: playerManager}}
					/>
					<Bar 
						valueProvider={{eventName: "mp", provider: playerManager}}
						borderColorProvider={{eventName: "combatColor", provider: playerManager}}
						color={"#0000ff"}
					/>
					<InventoryDisplay inventory={playerManager.inventory} slotsPerRow={4} displayCount={12} />
				</div>


			</div>
		)
	}
}