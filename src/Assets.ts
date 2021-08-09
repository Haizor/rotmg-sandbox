import Inventory from "./common/Inventory";
import PlayerManager from "./common/PlayerManager";
import AssetManager from "./game/engine/asset/AssetManager";
import RotMGAssetLoader from "./game/rotmg/asset/RotMGAssetLoader";
import RotMGSpritesheetLoader from "./game/rotmg/asset/RotMGSpritesheetLoader";
import Player from "./game/rotmg/data/Player";

export const assetManager = new AssetManager();
assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());

export const playerInventory = new Inventory(12);
export let playerClass: Player | undefined = undefined;
export const playerManager = new PlayerManager();

export const config = {
	name: "rotmg/base",
	containers: [
		{
			type: "rotmg",
			loader: "rotmg-loader",
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/equip.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/players.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/abyssOfDemonsObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/highTechTerrorObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/thirdDimensionObjects.xml"
			]
		},
		{
			type: "sprites",
			loader: "sprite-loader",
			sources: [
				"https://www.haizor.net/rotmg/assets/production/atlases/spritesheet.json"
			]
		}
	]
}