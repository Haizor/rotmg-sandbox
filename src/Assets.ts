import AssetManager from "./game/engine/asset/AssetManager";
import RotMGAssetLoader from "./game/rotmg/asset/RotMGAssetLoader";
import RotMGSpritesheetLoader from "./game/rotmg/asset/RotMGSpritesheetLoader";

export const assetManager = new AssetManager();
assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());

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