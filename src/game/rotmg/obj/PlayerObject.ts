import { EventResult } from "../../../common/EventEmitter";
import { Slot } from "../../../common/Inventory";
import PlayerManager from "../../../common/PlayerManager";
import Vec2 from "../../engine/logic/Vec2";
import ActivateProcessor from "../ActivateProcessor";
import { Action, Direction } from "../../../common/asset/rotmg/atlas/Spritesheet";
import Player from "../../../common/asset/rotmg/data/Player";
import Projectile from "../../../common/asset/rotmg/data/Projectile";
import { Stats } from "../../../common/asset/rotmg/data/Stats";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import ProjectileObject from "./ProjectileObject";
import Item from "common/asset/rotmg/data/Item";
import { PlayerCollisionFilter } from "./CollisionFilter";
import Color from "game/engine/logic/Color";

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
	rotationSpeed = 1;
	zoom: number = 6;
	direction: PlayerDirection = PlayerDirection.Front;
	moving = false;
	data: Player;
	shootDelay: number = 500;
	stats: Stats = new Stats();
	manager: PlayerManager;
	activateProcessor: ActivateProcessor;

	mp: number = -1;

	private _animSpeed = 500;
	private _movingTicks = 0;
	private _shootingTicks = 0;
	private _lastAbilityTime = 0;
	private _lastShotTime = 0;
	private _lastDamageTime = 0;
	private _inCombat: boolean = false;

	constructor(manager: PlayerManager) {
		super();
		this.data = manager.class as Player;
		this.manager = manager;
		this.stats = manager.getStats();
		this.activateProcessor = new ActivateProcessor(this);

		this.manager.inventory.on("use", this.useItem)
		this.manager.on("updateStats", this.updateStats);
		this.updateStats();

		this.manager.onHealthChange(this.getHealth(), this.getMaxHealth());
		this.manager.onManaChange(this.mp, this.stats.mp);
		
	}

	setHealth(hp: number) {
		const result = super.setHealth(hp);
		this.manager.onHealthChange(hp, this.getMaxHealth());
		return result;
	}

	onDamaged(amount: number) {
		super.onDamaged(amount);
		if (amount > this.getStats().getDamageReqForCombat()) {
			this._inCombat = true;
			this._lastDamageTime = this.time;
			this.manager.setInCombat(true)
		}
	}

	getDefense() {
		return this.getStats().def;
	}

	getBarBackColor() {
		return this._inCombat ? Color.Yellow : Color.Black;
	}

	onDeleted() {
		this.manager.remove("updateStats", this.updateStats);
	}

	updateStats = () => {
		this.data = this.manager.class ?? this.data;
		this.stats = this.manager.getStats();
		this.manager.onManaChange(this.mp, this.stats.mp);

		if (this.mp === -1) {
			this.mp = this.stats.mp;
		}
		
		this.setMaxHealth(this.stats.hp);
		return EventResult.Pass;
	}

	useItem = ([slot]: [Slot]) => {
		if (slot.item !== undefined) {
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
		const ability = this.getAbility()?.data;
		if (ability !== undefined) {
			this.useItem([this.manager.inventory.slots[1]]);
			this.setMana(this.mp - ability.mpCost)
		}
	}

	getDamage(proj: Projectile) {
		const weapon = this.getWeapon();
		if (weapon !== undefined) {
			const min = proj.minDamage ?? 0;
			const max = proj.maxDamage ?? min;
			return this.getStats().getAttackDamage(min + (Math.random() * (max - min)));
		}
		return 0;
	}

	setMana(mana: number) {
		this.mp = Math.min(mana, this.stats.mp)
		this.manager.onManaChange(this.mp, this.stats.mp);
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.scene === null) {
			return;
		}

		const moveVec = new Vec2(0, 0);
		const inputController = this.scene.game.inputController;

		if (inputController.isKeyDown("w")) {
			this.direction = PlayerDirection.Front;
			moveVec.y += (1);
		} else if (inputController.isKeyDown("s")) {
			this.direction = PlayerDirection.Back;
			moveVec.y -= (1);
		}

		if (inputController.isKeyDown("a")) {
			this.direction = PlayerDirection.Left;
			moveVec.x -= (1);
		} else if (inputController.isKeyDown("d")) {
			this.direction = PlayerDirection.Right;
			moveVec.x += (1);
		}

		if (inputController.isKeyDown("q")) {
			this.rotation -= this.rotationSpeed;
		} else if (inputController.isKeyDown("e")) {
			this.rotation += this.rotationSpeed;
		}

		if (inputController.isKeyPressed("o")) {
			this.zoom += 1;
		} else if (inputController.isKeyPressed("p")) {
			this.zoom -= 1;
		}
		
		const regenMult = this._inCombat ? 1 : 2;

		if (this._inCombat) {
			const time = this.getStats().getInCombatTime() * 1000;
			if (this._lastDamageTime + time < this.time) {
				this._inCombat = false;
				this.manager.setInCombat(false);
			}
		}

		this.heal(this.stats.getHealthPerSecond() / 1000 * elapsed * regenMult);
		this.setMana(this.mp + (this.stats.getManaPerSecond() / 1000 * elapsed * regenMult))

		//TODO: change move to account for this kinda thing
		if (moveVec.x !== 0 || moveVec.y !== 0) {
			this._movingTicks += elapsed;
			const mod = this.getMoveSpeed(elapsed);
			const realMoveVec = moveVec.rotate((this.rotation + 90) * (Math.PI / 180)).mult(new Vec2(mod, mod));
			this.move(realMoveVec);
		} else {
			this._movingTicks = 0;
		}

		const weapon = this.getWeapon()?.data;
		if (weapon !== undefined && this.getGame()?.inputController.isMouseButtonDown(0) && weapon.hasProjectiles()) {
			this._shootingTicks += elapsed;
			
			const worldPos = this.scene.camera.clipToWorldPos(this.getGame()?.inputController.getMousePos() as Vec2);
			const baseAngle = (Math.atan2(-worldPos.y + this.position.y, worldPos.x - this.position.x) * (180 / Math.PI)) + 180;
			this.direction = getDirectionFromAngle(baseAngle - this.rotation);

			if (this.canShoot()) {
				const projectile = weapon.projectiles[0] as Projectile;

				for (let i = 0; i < weapon.numProjectiles; i++) {
					let angle = baseAngle - (weapon.arcGap * weapon.numProjectiles / 2) + (weapon.arcGap * i);
					this.scene.addObject(new ProjectileObject(this.position, projectile, {
						angle,
						damage: this.getDamage(projectile),
						projNumber: i,
						collisionFilter: PlayerCollisionFilter
					}));
				}
	
				this._lastShotTime = this.time;
			}
		} else {
			this._shootingTicks = 0;
		}

		if (this.getGame()?.inputController.isKeyDown(" ") && this.canUseAbility()) {
			this.useAbility();
			this._lastAbilityTime = this.time;
		}

		this.flipSprite = this.direction === PlayerDirection.Left;
	}

	canShoot(): boolean {
		const weapon = this.getWeapon()?.data;
		const attackDelay = ((1 / (this.getStats().getAttacksPerSecond() * (weapon !== undefined ? weapon.rateOfFire : 1))) * 1000);
		
		return this.time - attackDelay >= this._lastShotTime;
	}

	canUseAbility(): boolean {
		const ability = this.getAbility()?.data;
		
		return ability !== undefined && (this.time - (ability.cooldown * 1000) >= this._lastAbilityTime) && (this.mp >= ability.mpCost);
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
	
	getWeapon(): Item | undefined {
		return this.manager.inventory.getItem(0);
	}

	getAbility(): Item | undefined {
		return this.manager.inventory.getItem(1);
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
			const sprites = game.renderHelper?.getSpritesFromObject(this.data, {
				action,
				direction: spriteDirection,
				time: tick
			});

			if (sprites === undefined || sprites.length === 0) {
				return undefined;
			}
			if (sprites.length > 2) {
				sprites.shift();
			}
			const anim = Math.floor((tick % animSpeed) / (animSpeed / 2));
			return sprites[anim];
		}

		return game.renderHelper?.getSpriteFromObject(this.data, { direction: spriteDirection });
	}
}