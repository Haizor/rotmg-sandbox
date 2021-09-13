import BoostRange from "common/asset/rotmg/data/activate/BoostRange";
import BulletCreate from "common/asset/rotmg/data/activate/BulletCreate";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import Decoy from "common/asset/rotmg/data/activate/Decoy";
import EffectBlast from "common/asset/rotmg/data/activate/EffectBlast";
import Heal from "common/asset/rotmg/data/activate/Heal";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import Magic from "common/asset/rotmg/data/activate/Magic";
import ObjectToss from "common/asset/rotmg/data/activate/ObjectToss";
import PoisonGrenade from "common/asset/rotmg/data/activate/PoisonGrenade";
import Shoot from "common/asset/rotmg/data/activate/Shoot";
import ShurikenAbility from "common/asset/rotmg/data/activate/ShurikenAbility";
import Teleport from "common/asset/rotmg/data/activate/Teleport";
import Trap from "common/asset/rotmg/data/activate/Trap";
import VampireBlast from "common/asset/rotmg/data/activate/VampireBlast";
import Equipment from "common/asset/rotmg/data/Equipment";
import Item from "common/asset/rotmg/data/Item";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import Color from "game/engine/logic/Color";
import Scene from "game/engine/logic/Scene";
import Vec2 from "game/engine/logic/Vec2";
import Activate from "../../common/asset/rotmg/data/activate/Activate";
import IncrementStat from "../../common/asset/rotmg/data/activate/IncrementStat";
import StatusEffect from "./effects/StatusEffect";
import { PlayerCollisionFilter } from "./obj/CollisionFilter";
import { DamageSource } from "./obj/DamageSource";
import DecoyObject from "./obj/DecoyObject";
import LivingObject from "./obj/LivingObject";
import NovaEffect from "./obj/NovaEffect";
import Particle from "./obj/Particle";
import PlayerObject from "./obj/PlayerObject";
import ProjectileObject from "./obj/ProjectileObject";
import RotMGObject from "./obj/RotMGObject";
import TossedObject from "./obj/TossedObject";
import TrapObject from "./obj/TrapObject";
import RotMGGame from "./RotMGGame";

export default class ActivateProcessor  {
	player: PlayerObject;
	constructor(player: PlayerObject) {
		this.player = player;
	}

	process(equip: Item, activate: Activate) {
		const game = this.player.getGame() as RotMGGame;
		const scene = this.player.getScene() as Scene;
		const wis = this.player.getStats().wis;
		const rawMousePos = game.scene.camera.clipToWorldPos(game.inputController.getMousePos());
		const mousePos = rawMousePos.round();
		
		if (activate instanceof IncrementStat) {
			const stats = (activate as IncrementStat).stats;
			this.player.manager.addStats(stats);
			this.player.heal(stats.hp);
			this.player.mp += stats.mp;
		} else if (activate instanceof BulletNova) {
			for (let i = 0; i < activate.numShots; i++) {
				const angle = i * (360 / activate.numShots);
				const projectile = new ProjectileObject(mousePos, equip.data.projectiles[0], {
					angle,
					projNumber: i,
					collisionFilter: PlayerCollisionFilter
				});
				scene.addObject(projectile);
			}

			const color = Color.fromHexNumber(parseInt(activate.color, 16));
			for (let i = 0; i < 5; i++) {
				const pos = Vec2.lerp(this.player.position, mousePos, i / 5)
				const particle = new Particle({
					color,
					lifetime: 500,
					target: pos,
					delta: Vec2.random(true).mult(1.5).toVec3(0)
				})
				scene.addObject(particle)
			}

		} else if (activate instanceof ConditionEffectAura || activate instanceof ConditionEffectSelf) {
			const radius = activate instanceof ConditionEffectAura ? activate.getRange(wis) : 5
			this.player.addStatusEffect(new StatusEffect(activate.effect, activate.getDuration(wis) * 1000));
			scene.addObject(new NovaEffect({
				colors: [Color.Red, Color.White],
				cycles: 10,
				range: radius,
				lifetime: 200,
				target: this.player.position
			}))
		} else if (activate instanceof Shoot) {
			this.player.shoot(equip, false);
		} else if (activate instanceof BoostRange) {
			this.player.addStatusEffect(new StatusEffect(StatusEffectType.Inspired, activate.duration * 1000, {
				speedBoost: activate.speedBoost,
				lifeBoost: activate.lifeBoost,
			}))
		} else if (activate instanceof ObjectToss) {
			scene.addObject(new TossedObject({
				onLand: (pos) => {
					const obj = new RotMGObject(game.assetManager.get<XMLObject>("rotmg", activate.objectId)?.value);
					obj.position = pos;
					scene.addObject(obj);
				},
				start: this.player.position, 
				target: mousePos, 
				tossTime: activate.throwTime * 1000, 
				color: Color.fromHexNumber(activate.color)
			}));
		} else if (activate instanceof HealNova) {
			this.player.heal(activate.getHealAmount(wis));
			scene.addObject(new NovaEffect({
				colors: [ Color.White ],
				cycles: 10,
				range: activate.getRange(wis),
				lifetime: 200,
				target: this.player.position
			}))
		} else if (activate instanceof Trap) {
			scene.addObject(new TossedObject({
				color: Color.fromHexNumber(activate.color), 
				start: this.player.position,
				target: mousePos,
				tossTime: activate.throwTime * 1000,
				onLand: (endPos) => {
					scene.addObject(new TrapObject(endPos, activate))
				}
			}));
		} else if (activate instanceof PoisonGrenade) {
			scene.addObject(new TossedObject({
				color: Color.fromHexString(activate.color), 
				start: this.player.position,
				target: mousePos,
				tossTime: activate.throwTime * 1000,
				onLand: (endPos) => {
					scene.addObject(new NovaEffect({
						colors: [Color.fromHexString(activate.color)],
						cycles: 10,
						lifetime: 0,
						range: activate.radius,
						target: endPos
					}))
					const enemies = scene.getObjectsWithinRange({position: endPos, radius: activate.radius, tag: "enemy"})
					for (const living of enemies) {
						(living as LivingObject).applyPoison(activate);
					}
				}
			}));
		} else if (activate instanceof VampireBlast) {
			scene.addObject(new NovaEffect({
				colors: [Color.fromHexString(activate.color)],
				cycles: 10,
				lifetime: 100,
				range: activate.radius,
				target: mousePos
			}))

			const enemies = scene.getObjectsWithinRange({position: mousePos, radius: activate.radius, tag: "enemy"})
			for (const living of enemies) {
				(living as LivingObject).damage(new DamageSource(this.player, activate.getDamage(wis), { ignoreDef: activate.ignoreDef }))
				if (activate.condEffect !== StatusEffectType.Nothing) {
					(living as LivingObject).addStatusEffect(new StatusEffect(activate.condEffect, activate.condDuration * 1000))
				}
			}
			this.player.heal(activate.heal * enemies.length);
		} else if (activate instanceof EffectBlast) {
			const range = activate.getRadius(wis);
			scene.addObject(new NovaEffect({
				colors: [Color.fromHexNumber(activate.color)],
				cycles: 10,
				lifetime: 100,
				range,
				reversed: activate.collapseEffect,
				target: mousePos,
			}))

			const enemies = scene.getObjectsWithinRange({position: mousePos, radius: range, tag: "enemy"})
			for (const living of enemies) {
				(living as LivingObject).addStatusEffect(new StatusEffect(activate.condEffect, activate.getDuration(wis) * 1000))
			}
		} else if (activate instanceof Teleport) {
			if (Vec2.dist(this.player.position, mousePos) <= activate.maxDistance) {
				if (this.player.canMoveTo(mousePos)) this.player.position = (mousePos);
			}
		} else if (activate instanceof Decoy) {
			const decoy = new DecoyObject({
				data: activate,
				direction: this.player.position.subtract(this.player.prevPosition).normalize().rotate((activate.angleOffset + 90) * (Math.PI / 180)),
				source: this.player
			})
			scene.addObject(decoy);
		} else if (activate instanceof ShurikenAbility) {
			this.player.addStatusEffect(new StatusEffect(activate.effect, Number.MAX_SAFE_INTEGER))
			this.player.canRegenMana = activate.enableManaRegen;
		} else if (activate instanceof Heal) {
			this.player.heal(activate.amount);
		} else if (activate instanceof Magic) {
			this.player.healMP(activate.amount)

		} else if (activate instanceof BulletCreate) {
			const mouseDist = Vec2.dist(this.player.position, rawMousePos);
			const angle = Vec2.angleBetween(this.player.position, rawMousePos);
			const offsetAngle = angle - activate.offsetAngle;
			const range = equip.data.projectiles[0].getRange();
			let dist = Math.min(Math.max(activate.minDistance, mouseDist), activate.maxDistance)
			if (activate.minDistance === activate.maxDistance) {
				dist = activate.minDistance / 2;
			}
			const startPosition = 
				new Vec2(-range / 2, 0)
				.rotate(offsetAngle * (Math.PI / 180))
				.add(this.player.position)
				.add(new Vec2(dist, 0).rotate(angle * (Math.PI / 180)))
			const projectileData = activate.type ? (scene.game.assetManager.get("rotmg", activate.type)?.value as Equipment).projectiles[0] : equip.data.projectiles[0]
			for (let i = 0; i < activate.numShots; i++) {
				const x = (activate.gapTiles * i) - ((activate.numShots * activate.gapTiles) / 2)
				const position = startPosition.add(new Vec2(x, 0).rotate((angle + activate.gapAngle) * (Math.PI / 180)))
				const projectile = new ProjectileObject(position, projectileData, {
					angle: offsetAngle,
					collisionFilter: PlayerCollisionFilter,
				})
				scene.addObject(projectile);
			}

		}
	}

	processFinish(activate: Activate) {
		if (activate instanceof ShurikenAbility) {
			this.player.canRegenMana = true;
			this.player.removeStatusEffect(activate.effect);
			if (this.player.mp > (this.player.getAbility()?.data.mpEndCost ?? 0))
			this.player.shoot(this.player.getAbility() as Item);
		}
	}
}