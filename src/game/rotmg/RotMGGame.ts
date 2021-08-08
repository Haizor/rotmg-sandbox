import AssetManager from "../engine/asset/AssetManager";
import ProgramAssetLoader from "../engine/asset/ProgramAssetLoader";
import ShaderAssetLoader from "../engine/asset/ShaderAssetLoader";
import TextureAssetLoader from "../engine/asset/TextureAssetLoader";
import Game from "../engine/Game";
import Vec2 from "../engine/logic/Vec2";
import RotMGAssetLoader from "./asset/RotMGAssetLoader";
import RotMGAssets from "./asset/RotMGAssets";
import WallTile from "./obj/WallTile";
import PlayerObject from "./obj/PlayerObject";
import PlayerCamera from "./obj/PlayerCamera";
import Player from "./data/Player";
import RenderHelper from "./RenderHelper";
import Wall from "./data/Wall";
import EnemyObject from "./obj/EnemyObject";
import Equipment from "./data/Equipment";
import XMLObject from "./data/XMLObject";
import RotMGSpritesheetLoader from "./asset/RotMGSpritesheetLoader";

export default class RotMGGame extends Game {
	player: PlayerObject | undefined;
	renderHelper: RenderHelper | undefined;

	populateAssetManager(): AssetManager {
		this.assetManager = new AssetManager();

		this.assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
		this.assetManager.registerLoader("shader-loader", new ShaderAssetLoader(this.gl));
		this.assetManager.registerLoader("program-loader", new ProgramAssetLoader(this.gl, this.assetManager));
		this.assetManager.registerLoader("texture-loader", new TextureAssetLoader(this.gl));
		this.assetManager.registerLoader("sprite-loader", new RotMGSpritesheetLoader());
		return this.assetManager;
	}

	getAssetConfig() {
		return config;
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		this.renderHelper = new RenderHelper(this.assetManager);

		const rogue = this.assetManager.get<Player>("rotmg", "Rogue")?.value as Player;

		this.player = new PlayerObject(rogue, this.assetManager.get<Equipment>("rotmg", "Cheerful Chipper")?.value as Equipment);
		this.player.updatePosition(new Vec2(0, 0));

		for (let x = 0; x < 10; x++) {
			this.scene.addObject(new WallTile(new Vec2(x, 5), this.assetManager.get<Wall>("rotmg", "Abyss Volcanic Wall")?.value as Wall));
		}

		const enemy = new EnemyObject();
		enemy.texture = this.assetManager.get<XMLObject>("rotmg", "Abyss Fireball")?.value.texture;
		this.scene.addObject(enemy);

		this.scene.camera = new PlayerCamera(this.player)
		this.scene.addObject(this.player)
	}
}

const config = {
	name: "rotmg/engine",
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
			type: "shaders",
			loader: "shader-loader",
			sources: [
				{
					name: "vertex/base",
					src: "./shaders/vertex/base.glsl",
					type: "vertex"
				},
				{
					name: "vertex/textured",
					src: "./shaders/vertex/textured.glsl",
					type: "vertex"
				},
				{
					name: "vertex/billboard",
					src: "./shaders/vertex/billboard.glsl",
					type: "vertex"
				},
				{
					name: "fragment/color",
					src: "./shaders/fragment/color.glsl",
					type: "fragment"
				},
				{
					name: "fragment/textured",
					src: "./shaders/fragment/textured.glsl",
					type: "fragment"
				}
			]
		},
		{
			type: "programs",
			loader: "program-loader",
			depends: [
				"shaders"
			],
			sources: [
				{
					name: "base",
					vertex: "vertex/base",
					fragment: "fragment/color"
				},
				{
					name: "textured",
					vertex: "vertex/textured",
					fragment: "fragment/textured"
				},
				{
					name: "billboard",
					vertex: "vertex/billboard",
					fragment: "fragment/textured"
				}
			]
		},
		{
			type: "textures",
			loader: "texture-loader",
			sources: [
				{
					name: "spriteAtlas/4",
					src: "https://www.haizor.net/rotmg/assets/production/atlases/mapObjects.png"
				},
				{
					name: "spriteAtlas/2",
					src: "https://www.haizor.net/rotmg/assets/production/atlases/characters.png"
				},
				{
					name: "spriteAtlas/1",
					src: "https://www.haizor.net/rotmg/assets/production/atlases/groundTiles.png"
				}
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