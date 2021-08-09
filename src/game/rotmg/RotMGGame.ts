import AssetManager from "common/asset/normal/AssetManager";
import ProgramAssetLoader from "common/asset/normal/ProgramAssetLoader";
import ShaderAssetLoader from "common/asset/normal/ShaderAssetLoader";
import TextureAssetLoader from "common/asset/normal/TextureAssetLoader";
import Game from "../engine/Game";
import Vec2 from "../engine/logic/Vec2";
import WallTile from "./obj/WallTile";
import PlayerObject from "./obj/PlayerObject";
import PlayerCamera from "./obj/PlayerCamera";
import RenderHelper from "./RenderHelper";
import Wall from "../../common/asset/rotmg/data/Wall";
import EnemyObject from "./obj/EnemyObject";
import Equipment from "../../common/asset/rotmg/data/Equipment";
import XMLObject from "../../common/asset/rotmg/data/XMLObject";
import PlayerManager from "../../common/PlayerManager";

export default class RotMGGame extends Game {
	player: PlayerObject | undefined;
	renderHelper: RenderHelper | undefined;
	playerManager: PlayerManager;

	constructor(canvas: HTMLCanvasElement, manager: AssetManager, player: PlayerManager) {
		super(canvas, manager);
		this.playerManager = player; 
	}

	populateAssetManager(): AssetManager {
		this.assetManager.registerLoader("shader-loader", new ShaderAssetLoader(this.gl));
		this.assetManager.registerLoader("program-loader", new ProgramAssetLoader(this.gl, this.assetManager));
		this.assetManager.registerLoader("texture-loader", new TextureAssetLoader(this.gl));
		return this.assetManager;
	}

	getAssetConfig() {
		return config;
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		this.renderHelper = new RenderHelper(this.assetManager);

		this.player = new PlayerObject(this.playerManager);
		this.player.updatePosition(new Vec2(0, 0));

		for (let x = 0; x < 10; x++) {
			this.scene.addObject(new WallTile(new Vec2(x, 5), this.assetManager.get<Wall>("rotmg", "Abyss Volcanic Wall")?.value as Wall));
		}

		const enemy = new EnemyObject();
		enemy.texture = this.assetManager.get<XMLObject>("rotmg", "Malphas Protector")?.value.texture;
		this.scene.addObject(enemy);

		this.scene.camera = new PlayerCamera(this.player, this.canvas)
		this.scene.addObject(this.player)
	}
}

const config = {
	name: "rotmg/engine",
	containers: [
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
		}
	]
}