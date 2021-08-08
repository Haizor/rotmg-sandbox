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

export default class RotMGGame extends Game {
	player: PlayerObject | undefined;
	renderHelper: RenderHelper | undefined;

	populateAssetManager(): AssetManager {
		this.assetManager = new AssetManager(config);

		this.assetManager.registerLoader("rotmg-loader", new RotMGAssetLoader());
		this.assetManager.registerLoader("shader-loader", new ShaderAssetLoader(this.gl));
		this.assetManager.registerLoader("program-loader", new ProgramAssetLoader(this.gl, this.assetManager));
		this.assetManager.registerLoader("texture-loader", new TextureAssetLoader(this.gl));
		return this.assetManager;
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		this.renderHelper = new RenderHelper(this.assetManager.get<RotMGAssets>("rotmg"), this.assetManager.get("textures"));
		const rotmg = this.assetManager.get<RotMGAssets>("rotmg");
		const rogue = rotmg.getObjectFromId("Rogue") as Player;

		this.player = new PlayerObject(rogue, rotmg.getObjectFromId("Cheerful Chipper") as Equipment);
		this.player.updatePosition(new Vec2(0, 0));

		this.scene.addObject(new WallTile(new Vec2(5, 5), rotmg.getObjectFromId("Abyss Column Wall") as Wall));
		this.scene.addObject(new EnemyObject());

		this.scene.camera = new PlayerCamera(this.player)
		this.scene.addObject(this.player)
	}
}

const config = [
	{
		name: "rotmg",
		loader: "rotmg-loader",
		sources: [
			"https://www.haizor.net/rotmg/assets/production/xml/equip.xml",
			"https://www.haizor.net/rotmg/assets/production/xml/players.xml",
			"https://www.haizor.net/rotmg/assets/production/xml/abyssOfDemonsObjects.xml",
			"https://www.haizor.net/rotmg/assets/production/xml/projectiles.xml"
		]
	},
	{
		name: "shaders",
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
		name: "programs",
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
		name: "textures",
		loader: "texture-loader",
		sources: [
			{
				name: "mapObjects",
				src: "https://www.haizor.net/rotmg/assets/production/atlases/mapObjects.png"
			},
			{
				name: "groundTiles",
				src: "https://www.haizor.net/rotmg/assets/production/atlases/groundTiles.png"
			},
			{
				name: "characters",
				src: "https://www.haizor.net/rotmg/assets/production/atlases/characters.png"
			}
		]
	}
]