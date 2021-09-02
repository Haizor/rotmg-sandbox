import AssetManager from "common/asset/normal/AssetManager";
import ProgramAssetLoader from "common/asset/normal/loaders/ProgramAssetLoader";
import ShaderAssetLoader from "common/asset/normal/loaders/ShaderAssetLoader";
import NewSpritesheet from "common/asset/rotmg/atlas/NewSpritesheet";
import { Character } from "common/asset/rotmg/data/Character";
import Wall from "../../common/asset/rotmg/data/Wall";
import PlayerManager from "../../common/PlayerManager";
import Game from "../engine/Game";
import Vec2 from "../engine/logic/Vec2";
import EnemyObject from "./obj/EnemyObject";
import PlayerCamera from "./obj/PlayerCamera";
import PlayerObject from "./obj/PlayerObject";
import WallTile from "./obj/WallTile";
import RenderHelper from "./RenderHelper";

export default class RotMGGame extends Game {
	player: PlayerObject | undefined;
	renderHelper: RenderHelper | undefined;
	playerManager: PlayerManager;
	textCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(glCanvas: HTMLCanvasElement, textCanvas: HTMLCanvasElement, manager: AssetManager, player: PlayerManager) {
		super(glCanvas, manager);
		this.textCanvas = textCanvas;
		this.playerManager = player; 
		this.ctx = textCanvas.getContext("2d");
	}

	populateAssetManager(): AssetManager {
		this.assetManager.registerLoader("shader-loader", new ShaderAssetLoader(this.gl));
		this.assetManager.registerLoader("program-loader", new ProgramAssetLoader(this.gl, this.assetManager));
		return this.assetManager;
	}

	getAssetConfig() {
		return config;
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		for (const container of this.assetManager.getContainers("sprites")) {
			if (container instanceof NewSpritesheet) {
				container.gl = this.gl;
			}
		}
		this.renderHelper = new RenderHelper(this.assetManager);

		this.player = new PlayerObject(this.playerManager);
		this.player.updatePosition(new Vec2(0, 0));

		for (let x = -10; x < 10; x++) {
			if (x !== 5)
			this.scene.addObject(new WallTile(new Vec2(x, 5), this.assetManager.get<Wall>("rotmg", "Abyss Volcanic Wall")?.value as Wall));
		}

		const enemy = new EnemyObject(this.assetManager.get<Character>("rotmg", "Archdemon Malphas")?.value as Character);
		enemy.move(new Vec2(0, 10))
		this.scene.addObject(enemy);

		this.scene.camera = new PlayerCamera(this.player, this.canvas)
		this.scene.addObject(this.player)
	}

	render(time: number) {
		this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
		super.render(time);
	}

	stop() {
		super.stop();
		const bundle = this.assetManager.getBundle("rotmg/engine")
		if (bundle !== undefined) console.log(this.assetManager.deleteAssetBundle(bundle));
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
				},
				{
					name: "billboard/color",
					vertex: "vertex/billboard",
					fragment: "fragment/color"
				},
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