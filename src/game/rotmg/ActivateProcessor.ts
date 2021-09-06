import BoostRange from "common/asset/rotmg/data/activate/BoostRange";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import ObjectToss from "common/asset/rotmg/data/activate/ObjectToss";
import Shoot from "common/asset/rotmg/data/activate/Shoot";
import Item from "common/asset/rotmg/data/Item";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import Activate from "../../common/asset/rotmg/data/activate/Activate";
import IncrementStat from "../../common/asset/rotmg/data/activate/IncrementStat";
import StatusEffect from "./effects/StatusEffect";
import { PlayerCollisionFilter } from "./obj/CollisionFilter";
import NovaEffect from "./obj/NovaEffect";
import Particle from "./obj/Particle";
import PlayerObject from "./obj/PlayerObject";
import ProjectileObject from "./obj/ProjectileObject";
import TossedObject from "./obj/TossedObject";
import RotMGGame from "./RotMGGame";

export default class ActivateProcessor  {
	player: PlayerObject;
	constructor(player: PlayerObject) {
		this.player = player;
	}

	process(equip: Item, activate: Activate) {
		const game = this.player.getGame() as RotMGGame;
		const wis = this.player.getStats().wis;
		
		if (activate instanceof IncrementStat) {
			const stats = (activate as IncrementStat).stats;
			this.player.manager.addStats(stats);
			this.player.heal(stats.hp);
			this.player.mp += stats.mp;
		} else if (activate instanceof BulletNova) {
			const mousePos = game.scene.camera.clipToWorldPos(game.inputController.getMousePos()).round();
			
			for (let i = 0; i < activate.numShots; i++) {
				const angle = i * (360 / activate.numShots);
				const projectile = new ProjectileObject(mousePos, equip.data.projectiles[0], {
					angle,
					projNumber: i,
					collisionFilter: PlayerCollisionFilter
				});
				game.scene.addObject(projectile);
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
				game.scene.addObject(particle)
			}

		} else if (activate instanceof ConditionEffectAura || activate instanceof ConditionEffectSelf) {
			const radius = activate instanceof ConditionEffectAura ? activate.getRange(wis) : 5
			this.player.addStatusEffect(new StatusEffect(activate.effect, activate.getDuration(wis) * 1000));
			game.scene.addObject(new NovaEffect({
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
			const pos = game.scene.camera.clipToWorldPos(game.inputController.getMousePos()).round();
			this.player.getScene()?.addObject(new TossedObject({
				objectId: activate.objectId, 
				start: this.player.position, 
				target: pos, 
				tossTime: activate.throwTime * 1000, 
				color: Color.fromHexNumber(activate.color)
			}));
		} else if (activate instanceof HealNova) {
			this.player.heal(activate.getHealAmount(wis));
			console.log(activate.getRange(wis))
			this.player.getScene()?.addObject(new NovaEffect({
				colors: [ Color.White ],
				cycles: 10,
				range: activate.getRange(wis),
				lifetime: 200,
				target: this.player.position
			}))
		}
	}
}