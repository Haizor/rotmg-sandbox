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
import { DamageSource } from "./DamageSource";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import StatusEffect from "../effects/StatusEffect";

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
	private _shotCount = 0;
	private _inCombat: boolean = false;

	constructor(manager: PlayerManager) {
		super();
		this.data = manager.class as Player;
		this.manager = manager;
		this.stats = manager.getStats();
		this.activateProcessor = new ActivateProcessor(this);
		this.addTag("player");

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

	onDamaged(source: DamageSource<any>) {
		super.onDamaged(source);
		if (source.amount > this.getStats().getDamageReqForCombat()) {
			this._inCombat = true;
			this._lastDamageTime = this.time;
			this.manager.setInCombat(true)
		}
	}

	getDefense() {
		this.defense = this.getStats().def;
		return super.getDefense();
	}

	getDamageMultiplier() {
		if (this.hasStatusEffect(StatusEffectType.Damaging)) {
			return 1.25;
		}
		return 1;
	}

	getRateOfFireMultiplier() {
		if (this.hasStatusEffect(StatusEffectType.Berserk)) {
			return 1.25;
		}
		return 1;
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
			const stats = this.hasStatusEffect(StatusEffectType.Weak) ? new Stats() : this.getStats();
			const min = proj.minDamage ?? 0;
			const max = proj.maxDamage ?? min;
			return Math.floor(stats.getAttackDamage(min + (Math.random() * (max - min))) * this.getDamageMultiplier());
		}
		return 0;
	}

	setMana(mana: number) {
		if (this.hasStatusEffect(StatusEffectType.Quiet)) {
			this.mp = 0;
		} else {
			this.mp = Math.max(Math.min(mana, this.stats.mp), 0)
		}
		this.manager.onManaChange(this.mp, this.stats.mp);
	}

	getKey(direction: PlayerDirection) {
		if (this.hasStatusEffect(StatusEffectType.Confused)) {
			switch(direction) {
				case PlayerDirection.Front:
					return "d"
				case PlayerDirection.Back:
					return "a"
				case PlayerDirection.Left:
					return "s"
				case PlayerDirection.Right:
					return "w"
			}
		} 
		switch(direction) {
			case PlayerDirection.Front:
				return "w"
			case PlayerDirection.Back:
				return "s"
			case PlayerDirection.Left:
				return "a"
			case PlayerDirection.Right: 
				return "d"
		}
	}

	update(elapsed: number) {
		super.update(elapsed);

		if (this.scene === null) {
			return;
		}

		const moveVec = new Vec2(0, 0);
		const inputController = this.scene.game.inputController;

		if (inputController.isKeyDown(this.getKey(PlayerDirection.Front))) {
			this.direction = PlayerDirection.Front;
			moveVec.y += (1);
		} else if (inputController.isKeyDown(this.getKey(PlayerDirection.Back))) {
			this.direction = PlayerDirection.Back;
			moveVec.y -= (1);
		}

		if (inputController.isKeyDown(this.getKey(PlayerDirection.Left))) {
			this.direction = PlayerDirection.Left;
			moveVec.x -= (1);
		} else if (inputController.isKeyDown(this.getKey(PlayerDirection.Right))) {
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

		if (!this.hasStatusEffect(StatusEffectType.Bleeding))
		this.heal(this.stats.getHealthPerSecond() / 1000 * elapsed * regenMult);
		this.setMana(this.mp + ((this.getMPPerSecond() / 1000 * elapsed * regenMult)))

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
			//TODO: bad fix
			const worldPos = this.scene.camera.clipToWorldPos(this.getGame()?.inputController.getMousePos() as Vec2);
			let baseAngle = (Math.atan2(-worldPos.y + this.position.y, worldPos.x - this.position.x) * (180 / Math.PI)) + 180;
			if (this.hasStatusEffect(StatusEffectType.Unstable)) {
				baseAngle += Math.floor((Math.random() * 15) - 7.5)
			}

			this.direction = getDirectionFromAngle(baseAngle - this.rotation);
			if (this.canShoot()) {
				this.shoot(this.getWeapon() as Item)
				this._lastShotTime = this.time;
			}
		} else {
			this._shootingTicks = 0;
		}

		if (this.getGame()?.inputController.isKeyDown(" ") && this.canUseAbility()) {
			this.useAbility();
			this._lastAbilityTime = this.time;
		}

		if (this.hasStatusEffect(StatusEffectType.Blind)) {
			const ctx = (this.getGame() as RotMGGame).ctx;
			const canvas = (this.getGame() as RotMGGame).textCanvas;
			if (ctx !== null) {
				ctx.fillStyle = "#000000CC";
				ctx.fillRect(0, 0, canvas.width, canvas.height)
			}
		}

		this.flipSprite = this.direction === PlayerDirection.Left;
	}

	shoot(item: Item, useStats: boolean = true) {
		if (this.scene === null) return;

		const worldPos = this.scene.camera.clipToWorldPos(this.getGame()?.inputController.getMousePos() as Vec2);
		let baseAngle = (Math.atan2(-worldPos.y + this.position.y, worldPos.x - this.position.x) * (180 / Math.PI)) + 180;
		if (this.hasStatusEffect(StatusEffectType.Unstable)) {
			baseAngle += (Math.random() * 30) - 15
		}


		const projectile = item.data.projectiles[0] as Projectile;
		const { arcGap, numProjectiles } = item.data;

		for (let i = 0; i < numProjectiles; i++) {
			let angle = baseAngle - (arcGap / 2) - (i * arcGap) + ((arcGap * numProjectiles) / 2)
			let { speedBoost, lifeBoost } = this.hasStatusEffect(StatusEffectType.Inspired) ? (this.getStatusEffect(StatusEffectType.Inspired) as StatusEffect).data : { speedBoost: 1, lifeBoost: 1}
			this.scene.addObject(new ProjectileObject(this.position, projectile, {
				angle,
				damage: useStats ? this.getDamage(projectile) : Math.floor(projectile.minDamage ?? 0 + (Math.random() * (projectile.maxDamage ?? 0 - (projectile.minDamage ?? 0)))),
				projNumber: this._shotCount,
				speedBoost,
				lifeBoost,
				collisionFilter: PlayerCollisionFilter
			}));
			this._shotCount++;
		}
	}

	getAttacksPerSecond(): number {
		const weapon = this.getWeapon()?.data;
		const stats = this.hasStatusEffect(StatusEffectType.Dazed) ? new Stats() : this.getStats();
		return (stats.getAttacksPerSecond() * (weapon !== undefined ? weapon.rateOfFire : 1)) * this.getRateOfFireMultiplier();
	}

	canShoot(): boolean {
		if (this.hasStatusEffect(StatusEffectType.Stasis) || this.hasStatusEffect(StatusEffectType.Stunned) || this.hasStatusEffect(StatusEffectType.Petrify)) {
			return false;
		}

		const attackDelay = (1 / this.getAttacksPerSecond()) * 1000;
		
		return this.time - attackDelay >= this._lastShotTime;
	}

	canUseAbility(): boolean {
		if (this.hasStatusEffect(StatusEffectType.Silenced)) {
			return false;
		}

		const ability = this.getAbility()?.data;
		
		return ability !== undefined && (this.time - (ability.cooldown * 1000) >= this._lastAbilityTime) && (this.mp >= ability.mpCost);
	}

	getShootAnimSpeed(): number {
		const attackDelay = (1 / this.getAttacksPerSecond()) * 1000;
		return attackDelay;
	}


	getMoveSpeed(elapsed: number) {
		const tps = (this.hasStatusEffect(StatusEffectType.Slowed) ? 4 : this.stats.getTilesPerSecond()) / 1000;
		return tps * elapsed * this.speedMultiplier;
	}

	getStats(): Stats {
		return this.stats;
	}

	getMPPerSecond(): number {
		return this.stats.getManaPerSecond() + (this.hasStatusEffect(StatusEffectType.Energized) ? 20 : 0)
	}
	
	getWeapon(): Item | undefined {
		return this.manager.inventory.getItem(0);
	}

	getAbility(): Item | undefined {
		return this.manager.inventory.getItem(1);
	}

	onStatusEffectApplied(effect: StatusEffect) {
		switch (effect.type) {
			case StatusEffectType.Quiet:
				this.setMana(0);
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

	getParticleColor() {
		return Color.Red;
	}

	getParticleProb() {
		return this.data.bloodProb;
	}
}