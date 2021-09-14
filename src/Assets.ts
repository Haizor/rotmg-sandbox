import PlayerManager from "./common/PlayerManager";
import AssetManager from "./common/asset/normal/AssetManager";
import RotMGAssetLoader from "./common/asset/rotmg/RotMGAssetLoader";
import RotMGSpritesheetLoader from "./common/asset/rotmg/RotMGSpritesheetLoader";
import Player from "./common/asset/rotmg/data/Player";
import DBHandler from "DBHandler";
import RotMGCustomSpriteLoader from "common/asset/rotmg/RotMGCustomSpriteLoader";
import Tooltip from "components/rotmg/tooltip/Tooltip";
import SpriteComponent from "components/rotmg/Sprite";

export const assetManager = new AssetManager();
assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());
assetManager.registerLoader("custom-sprite-loader", new RotMGCustomSpriteLoader());

export let playerClass: Player | undefined = undefined;
export const playerManager = new PlayerManager(assetManager);
Tooltip.setPlayerManager(playerManager);
SpriteComponent.setAssetManager(assetManager)

export const db = new DBHandler(assetManager);

export const config = {
	name: "rotmg/base",
	default: true,
	containers: [
		{
			type: "rotmg",
			loader: "rotmg-loader",
			sourceLoader: "url-to-text",
			settings: {
				readOnly: true,
				type: "object"
			},
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/equip.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/players.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/abyssOfDemonsObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/highTechTerrorObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/thirdDimensionObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/equipTest.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/allies.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/cursedLibraryObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/crystalCaveObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/oryxCastle.xml"
			]
		},
		{	
			type: "rotmg/ground",
			loader: "rotmg-loader",
			sourceLoader: "url-to-text",
			settings: {
				readOnly: true,
				type: "ground"
			},
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/ground.xml",
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


export const loading = Promise.all([assetManager.load(config), db.load()])