import { EventResult } from "../../../common/EventEmitter";
import { Slot } from "../../../common/Inventory";
import PlayerManager from "../../../common/PlayerManager";
import Vec2 from "../../engine/logic/Vec2";
import ActivateProcessor from "../ActivateProcessor";
import { Action, Direction } from "../../../common/asset/rotmg/atlas/Spritesheet";
import Equipment from "../../../common/asset/rotmg/data/Equipment";
import Player from "../../../common/asset/rotmg/data/Player";
import Projectile from "../../../common/asset/rotmg/data/Projectile";
import { Stats } from "../../../common/asset/rotmg/data/Stats";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import ProjectileObject from "./ProjectileObject";

enum PlayerDirection {
	Left,
	Right,
	Front,
	Back
}

export function getDirectionFromAngle(angle: number) {
	while (angle < 0) angle += 360;
	while (angle > 360) angle -= 360;

	if (angle > 45 && angle <= 135) {
		return PlayerDirection.Front;
	} else if (angle >= 135 && angle <= 225) {
		return PlayerDirection.Right;
	} else if (angle >= 225 && angle <= 315) {
		return PlayerDirection.Back;
	} else {
		return PlayerDirection.Left;
	}
} 

export default class PlayerObject extends LivingObject {
	speed: number = 50;
	rotation: number = 0;
	private readonly _speedMod = 0.1;
	private _animSpeed = 500;
	rotationSpeed = 1;
	direction: PlayerDirection = PlayerDirection.Front;
	moving = false;
	data: Player;
	shootDelay: number = 500;
	stats: Stats = new Stats();
	weapon: Equipment | undefined;
	private _movingTicks = 0;
	private _shootingTicks = 0;
	private _lastAbilityTime = 0;
	private _lastShotTime = 0;
	private _angle = 0;
	manager: PlayerManager;
	activateProcessor: ActivateProcessor;

	constructor(manager: PlayerManager) {
		super();
		this.data = manager.class as Player;
		this.manager = manager;
		this.weapon = manager.inventory.getItem(0)?.data;
		this.stats = manager.getStats();
		this.activateProcessor = new ActivateProcessor(this);
		this.manager.inventory.slots[0].on("change", this.updateWeapon);
		this.manager.inventory.on("use", this.useItem)
		this.manager.on("updateStats", this.updateStats);
	}

	onDeleted() {
		this.manager.inventory.slots[0].remove("change", this.updateWeapon);
		this.manager.remove("updateStats", this.updateStats);
	}

	updateWeapon = () => {
		this.weapon = this.manager.inventory.getItem(0)?.data;
		return EventResult.Pass;
	}

	updateStats = () => {
		this.stats = this.manager.getStats();
		return EventResult.Pass;
	}

	useItem = ([slot]: [Slot]) => {
		if (slot.item !== undefined) {
			console.log(slot.item)
			for (const activate of slot.item?.data.activates) {
				this.activateProcessor.process(slot.item, activate);
			}
			if (slot.item.data.consumable) {
				slot.setItem(undefined);
			}

			return EventResult.Success;
		}

		return EventResult.Pass;
	}

	useAbility() {
		this.useItem([this.manager.inventory.slots[1]]);
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.scene === null) {
			return;
		}

		const moveVec = new Vec2(0, 0);

		if (this.scene.game.inputController.isKeyDown("w")) {
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
			this._movingTicks += elapsed;
			const mod = this.getMoveSpeed(elapsed);
			const realMoveVec = moveVec.rotate((this.rotation + 90) * (Math.PI / 180)).mult(new Vec2(mod, mod));
			this.move(new Vec2(realMoveVec.x, 0));
			this.move(new Vec2(0, realMoveVec.y));
		} else {
			this._movingTicks = 0;
		}

		if (this.weapon !== undefined && this.getGame()?.inputController.isMouseButtonDown(0) && this.weapon.hasProjectiles()) {
			this._shootingTicks += elapsed;
			
			const worldPos = this.scene.camera.clipToWorldPos(this.getGame()?.inputController.getMousePos() as Vec2);
			const baseAngle = (Math.atan2(-worldPos.y + this.position.y, worldPos.x - this.position.x) * (180 / Math.PI)) + 180;
			this.direction = getDirectionFromAngle(baseAngle - this.rotation);

			if (this.canShoot()) {
				const projectile = this.weapon.projectiles[0] as Projectile;

				for (let i = 0; i < this.weapon.numProjectiles; i++) {
					let angle = baseAngle - (this.weapon.arcGap * this.weapon.numProjectiles / 2) + (this.weapon.arcGap * i);
					this.scene.addObject(new ProjectileObject(this.position, projectile, angle, i));
				}
	
				this._lastShotTime = this.time;
			}
		} else {
			this._shootingTicks = 0;
		}

		if (this.getGame()?.inputController.isKeyDown(" ") && this.time - 500 >= this._lastAbilityTime) {
			this.useAbility();
			this._lastAbilityTime = this.time;
		}

		this.flipSprite = this.direction === PlayerDirection.Left;
	}

	canShoot(): boolean {
		const attackDelay = ((1 / (this.getStats().getAttacksPerSecond() * (this.weapon !== undefined ? this.weapon.rateOfFire : 1))) * 1000);
		
		return this.time - attackDelay >= this._lastShotTime;
	}

	getShootAnimSpeed(): number {
		const attackDelay = (1 / this.getStats().getAttacksPerSecond()) * 1000;
		return attackDelay;
	}

	getMoveSpeed(elapsed: number) {
		return (this.stats.getTilesPerSecond() / 1000) * elapsed;
	}

	getStats(): Stats {
		return this.stats;
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
		
		if (this._movingTicks !== 0 || this._shootingTicks !== 0) {
			const animSpeed = this._shootingTicks !== 0 ? this.getShootAnimSpeed() : this._animSpeed;
			const tick = this._shootingTicks !== 0 ? this._shootingTicks : this._movingTicks;
			const action = this._shootingTicks !== 0 ? Action.Attack : Action.Walk;
			const sprites = game.renderHelper?.getSpritesFromObject(this.data, spriteDirection, action);

			if (sprites === undefined || sprites.length === 0) {
				return undefined;
			}
			if (sprites.length > 2) {
				sprites.shift();
			}
			const anim = Math.floor((tick % animSpeed) / (animSpeed / 2));
			return sprites[anim];
		}

		return game.renderHelper?.getSpriteFromObject(this.data, spriteDirection, Action.Walk);
	}
}