import PlayerManager from "./common/PlayerManager";
import DBHandler from "DBHandler";
import Tooltip from "components/rotmg/tooltip/Tooltip";
import SpriteComponent from "components/rotmg/Sprite";
import { AssetManager, RotMGAssetLoader, RotMGSpritesheetLoader, RotMGCustomSpriteLoader, RotMGStateLoader, Player } from "@haizor/rotmg-utils";

export const assetManager = new AssetManager();
assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());
assetManager.registerLoader("custom-sprite-loader", new RotMGCustomSpriteLoader());
assetManager.registerLoader("rotmg-state-loader", new RotMGStateLoader());

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
				"https://www.haizor.net/rotmg/assets/production/xml/players.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/abyssOfDemonsObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/highTechTerrorObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/thirdDimensionObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/allies.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/cursedLibraryObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/crystalCaveObjects.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/oryxCastle.xml",
				// "https://www.haizor.net/rotmg/assets/production/xml/secludedThicketObjects.xml"
			]
		},
		{
			type: "equipment",
			loader: "rotmg-loader",
			sourceLoader: "url-to-text",
			settings: {
				readOnly: true,
				type: "object"
			},
			sources: [
				"https://www.haizor.net/rotmg/assets/production/xml/equip.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml",
				"https://www.haizor.net/rotmg/assets/production/xml/equipTest.xml",
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
			type: "rotmg/states",
			loader: "rotmg-state-loader",
			sourceLoader: "url-to-text",
			sources: [
				"./behavior/test.xml"
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