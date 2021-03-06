import AssetManagerViewer from 'components/asset/AssetManagerViewer';
import RotMGAssetsEditor from 'components/asset/RotMGAssetsEditor';
import SpritesheetEditor from 'components/asset/SpritesheetEditor';
import PopupRenderer from 'components/PopupRenderer';
import Bar from 'components/rotmg/Bar';
import ChangeClass from 'components/rotmg/ChangeClass';
import GiveItemMenu from 'components/rotmg/GiveItemMenu';
import Vec2 from 'game/engine/logic/Vec2';
import EnemyObject from 'game/rotmg/obj/EnemyObject';
import RotMGGame from 'game/rotmg/RotMGGame';
import PopupManager from 'PopupManager';
import React from 'react';
import { AssetBundle, AssetContainer, RotMGAssets, Equipment, Player, Character } from '@haizor/rotmg-utils';
import styles from "./App.module.css";
import { assetManager, db, loading, playerManager } from './Assets';
import Canvas from './components/Canvas';
import LoadingScreen from './components/LoadingScreen';
import InventoryDisplay from './components/rotmg/InventoryDisplay';

const AssetEditors = new Map();
AssetEditors.set("sprites", (bundle: AssetBundle, container: AssetContainer<unknown>) => <SpritesheetEditor container={container} bundle={bundle} />)
AssetEditors.set("equipment", (bundle: AssetBundle, container: RotMGAssets) => <RotMGAssetsEditor container={container} bundle={bundle} />)

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
			playerManager.inventory.setItem(8, assetManager.get<Equipment>("equipment", "Bracer of the Guardian")?.value.createInstance());
			playerManager.inventory.setItem(9, assetManager.get<Equipment>("equipment", "Apple")?.value.createInstance());
			playerManager.inventory.setItem(10, assetManager.get<Equipment>("equipment", "Tablet of the King's Avatar")?.value.createInstance());
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
						<button onClick={() => PopupManager.popup("assetView", <AssetManagerViewer assetManager={assetManager} db={db} handlers={AssetEditors}/>)}>View Assets</button>
						<button onClick={() => PopupManager.popup("itemGive", <GiveItemMenu assetManager={assetManager} />)}>Give Items</button>
						<button onClick={() => PopupManager.popup("changeClass", <ChangeClass assetManager={assetManager} playerManager={playerManager}/>)}>Change Class</button>
						<button onClick={() => {
							const enemy = new EnemyObject(
								assetManager.get("rotmg", "Archdemon Malphas")?.value as Character, 
								assetManager.get("rotmg/states", "test")?.value as any
							);
							enemy.position = new Vec2(0, 10);
							RotMGGame.instance.scene.addObject(enemy)
						}}>Spawn Enemy</button>
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