import Vec2 from "../../engine/logic/Vec2";
import { Action, Direction } from "../asset/atlas/Spritesheet";
import RotMGAssets from "../asset/RotMGAssets";
import Player from "../data/Player";
import Projectile from "../data/Projectile";
import RotMGGame from "../RotMGGame";
import ProjectileObject from "./ProjectileObject";
import RotMGObject from "./RotMGObject";

enum PlayerDirection {
	Left,
	Right,
	Front,
	Back
}

export default class PlayerObject extends RotMGObject {
	speed: number = 50;
	rotation: number = 0;
	private readonly _speedMod = 0.1;
	private _animSpeed = 30;
	rotationSpeed = 1;
	direction: PlayerDirection = PlayerDirection.Front;
	moving = false;
	data: Player;
	shootDelay: number = 500;
	private _movingTicks = 0;
	private _lastShotTime = 0;
	private _angle = 0;

	constructor(data: Player) {
		super();
		this.data = data;
		
	}

	update(elapsed: number) {
		if (this.scene === null) {
			return;
		}

		// (document.getElementById("test") as HTMLElement).innerText = this.position.toString();

		const moveVec = new Vec2(0, 0);

		if (this.scene.game.inputController.isKeyDown("w")) {
			// this.position = this.position.add(angledVec.mult(new Vec2(0.1, 0.1)));
			this.direction = PlayerDirection.Front;
			moveVec.y += (1);
		} else if (this.scene.game.inputController.isKeyDown("s")) {
			this.direction = PlayerDirection.Back;
			moveVec.y -= (1);
		}

		if (this.scene.game.inputController.isKeyDown("a")) {
			this.direction = PlayerDirection.Left;
			moveVec.x -= (1);
		} else if (this.scene.game.inputController.isKeyDown("d")) {
			this.direction = PlayerDirection.Right;
			moveVec.x += (1);
		}

		if (this.scene.game.inputController.isKeyDown("q")) {
			this.rotation -= this.rotationSpeed;
		} else if (this.scene.game.inputController.isKeyDown("e")) {
			this.rotation += this.rotationSpeed;
		}

		//TODO: change move to account for this kinda thing
		if (moveVec.x !== 0 || moveVec.y !== 0) {
			this._movingTicks++;
			const realMoveVec = moveVec.rotate((this.rotation + 90) * (Math.PI / 180)).mult(new Vec2(this._speedMod, this._speedMod));
			this.move(new Vec2(realMoveVec.x, 0));
			this.move(new Vec2(0, realMoveVec.y));
			this.flipSprite = this.direction === PlayerDirection.Left;
		} else {
			this._movingTicks = 0;
		}

		if (this.getGame()?.inputController.isMouseButtonDown(0)) {
			const worldPos = this.scene.camera.clipToWorldPos(this.getGame()?.inputController.getMousePos() as Vec2);
			const projectile = this.getGame()?.assetManager.get<RotMGAssets>("rotmg").getObjectFromId("Sword of Majesty")?.projectiles[0] as Projectile;
			let angle = Math.atan2(-worldPos.y + this.position.y, worldPos.x - this.position.x) * (180 / Math.PI);
			angle += 180
			this.scene.addObject(new ProjectileObject(this.position, projectile, angle));
		}
	}

	getSprite() {
		const game = this.getGame() as RotMGGame;
		let spriteDirection = Direction.Front;

		switch(this.direction) {
			case PlayerDirection.Front:
				spriteDirection = Direction.Front;
				break;
			case PlayerDirection.Back:
				spriteDirection = Direction.Back;
				break;
			case PlayerDirection.Left:
				spriteDirection = Direction.Side;
				break;
			case PlayerDirection.Right:
				spriteDirection = Direction.Side;
				break;
		}

		if (this._movingTicks === 0) {
			return game.renderHelper?.getSpriteFromObject(this.data, spriteDirection, Action.Walk);
		} else {
			const sprites = game.renderHelper?.getSpritesFromObject(this.data, spriteDirection, Action.Walk);
			if (sprites === undefined || sprites.length === 0) {
				return undefined;
			}
			if (sprites.length > 2) {
				sprites.shift();
			}
			const anim = Math.floor((this._movingTicks % this._animSpeed) / (this._animSpeed / 2));
			return sprites[anim];
		}
	}
}