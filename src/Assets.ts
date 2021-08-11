import Inventory from "./common/Inventory";
import PlayerManager from "./common/PlayerManager";
import AssetManager from "./common/asset/normal/AssetManager";
import RotMGAssetLoader from "./common/asset/rotmg/RotMGAssetLoader";
import RotMGSpritesheetLoader from "./common/asset/rotmg/RotMGSpritesheetLoader";
import Player from "./common/asset/rotmg/data/Player";

export const assetManager = new AssetManager();
assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());

export let playerClass: Player | undefined = undefined;
export const playerManager = new PlayerManager();

export const config = {
	name: "rotmg/base",
	containers: [
		{
			type: "rotmg",
			loader: "rotmg-loader",
			sourceLoader: "url-to-text",
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/equip.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/players.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/abyssOfDemonsObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/highTechTerrorObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/thirdDimensionObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/equipTest.xml"
			]
		},
		{
			type: "test",
			loader: "rotmg-loader",
			sourceLoader: "url-to-text",
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/equipTest.xml"
			]
		},
		{
			type: "sprites",
			loader: "sprite-loader",
			sourceLoader: "url-to-text",
			sources: [
				"https://www.haizor.net/rotmg/assets/production/atlases/spritesheet.json"
			]
		}
	]
}