import AssetManager from "common/asset/normal/AssetManager";
import Rect from "../../engine/logic/Rect";
import Vec2 from "../../engine/logic/Vec2";
import GameObject, { RenderPriority } from "../../engine/obj/GameObject";
import Projectile from "../../../common/asset/rotmg/data/Projectile";
import ProjectileRender from "../../../common/asset/rotmg/data/ProjectileRender";
import RotMGGame from "../RotMGGame";
import LivingObject from "./LivingObject";
import RotMGObject from "./RotMGObject";
import { CollisionFilter } from "./CollisionFilter";
import { DamageSource } from "./DamageSource";
import Particle from "./Particle";
import Color from "game/engine/logic/Color";
import { mat4 } from "gl-matrix";
import StatusEffect from "../effects/StatusEffect";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import { AnimatedTexture } from "common/asset/rotmg/data/Texture";

export type ProjectileOptions = {
	damage?: number,
	projNumber?: number,
	speedBoost?: number,
	lifeBoost?: number,
	angle: number,
	collisionFilter: CollisionFilter
}

export default class ProjectileObject extends RotMGObject {
	data: Projectile;
	angle: number = 0;
	damage: number = 0;
	projNumber: number = 0;
	accelerationSpeed: number = 0;
	renderData?: ProjectileRender;
	filter: CollisionFilter
	speedBoost: number;
	lifeBoost: number;
	verts: number[] = [];
	texVerts: number[] = [];

	private _currLifetime = 0;
	private _collided: GameObject[] = [];
	private _circleTurned: boolean = false;

	get position() {
		return this._position.add(this.getAmplitudeVec());
	}

	set position(pos: Vec2) {
		this._position = pos;
	}

	constructor(pos: Vec2, data: Projectile, options: ProjectileOptions) {
		super();
		this.addTag("projectile");

		this.data = data;

		this.renderPriority = RenderPriority.High;
		this.updatePosition(pos);
		this.angle = options.angle;
		this.damage = options.damage ?? this.data.getDamage() ?? 0;
		this.projNumber = options.projNumber ?? 0;
		this.filter = options.collisionFilter;
		this.speedBoost = options.speedBoost ?? 1;
		this.lifeBoost = options.lifeBoost ?? 1;
	}

	onAddedToScene() {
		this.setData(this.data);
	}

	getCollisionBox() {
		return Rect.Zero.expand(0.1, 0.1)
	}

	setData(data: Projectile) {
		this.data = data;
		const rotmg = this.getGame() as RotMGGame;
		this.renderData = this.getAssetManager()?.get("rotmg", data.objectId)?.value as ProjectileRender;
		if (!(this.renderData.texture instanceof AnimatedTexture)) {
			this.sprite = rotmg.renderHelper?.getSpriteFromObject(this.renderData);
		}

		this.outlineSize = 0;
		this.verts = this.getVerts(this.sprite);
	} 

	canCollideWith(obj: GameObject): boolean {
		return !(obj.hasTag("projectile")) && this._collided.findIndex(o => o === obj) === -1 && this.filter(this, obj);
	}

	collidesWith(newPos: Vec2, obj: GameObject) {
		return obj.getCollisionBox().translate(obj.position).contains(newPos);
	}

	preventsMovement() {
		return false;
	}

	onCollision(obj: GameObject) {
		const spawnParticles = () => {
			let color = obj instanceof RotMGObject ? obj.getParticleColor() : Color.Red;
			for (let i = 0; i < 10; i++) {
				const prob = (obj instanceof RotMGObject) ? obj.getParticleProb() : 1;
				if (Math.random() < prob) {
					const part = new Particle({
						target: this.position, 
						lifetime: 200, 
						color, 
						scale: 2,
						delta: Vec2.random(true).mult(7).toVec3(0)
					})
					this.scene?.addObject?.(part);
				}
			}
		}

		if (obj instanceof LivingObject) { 
			if (this._collided.findIndex((o) => o === obj) === -1) {
				obj.damage(new DamageSource(this, this.damage, {ignoreDef: this.data.armorPiercing || obj.hasStatusEffect(StatusEffectType["Armor Broken"])}));
				if (this.data.conditionEffect !== undefined) {
					const effect = new StatusEffect(this.data.conditionEffect.type, this.data.conditionEffect.duration * 1000);
					obj.addStatusEffect(effect);
				}
				this._collided.push(obj)
				spawnParticles();
			}

			if (!this.data.multiHit) {
				this.delete();

			}
			return;
		}

		if (obj.hasTag("cover") && this.data.passesCover) {
			return;
		}
		
		spawnParticles();
		this.delete();
	}


	getAmplitudeVec(): Vec2 {
		let amplitude = this.data.amplitude;
		let frequency = this.data.frequency;

		if (this.data.parametric) {
			const magnitude = 3;
            const t = 0.25 + (this.projNumber % 4 * 0.5) + (this._currLifetime / this.data.lifetime) * (this.projNumber % 4 >= 2 ? -1 : 1);
            const x  = (Math.cos(2 * Math.PI * t)) * magnitude;
            const y = (Math.sin(4 * Math.PI * t)) * magnitude;

            return new Vec2(x, y).rotate((this.angle) * (Math.PI / 180));
		}

		if (this.data.wavy) {
			amplitude = (this._currLifetime / 1000 * 0.4) * (this.data.amplitude || 1)
			frequency = this.data.frequency || 2.75
		}

		if (amplitude === 0 || frequency === 0) {
			return Vec2.Zero;
		}

		const sine = (this.projNumber % 2 === 0 ? 1 : -1) * Math.sin(((this._currLifetime / this.data.lifetime) * Math.PI * 2) * frequency) * amplitude;
		const vec = new Vec2(0, sine).rotate(this.angle * (Math.PI / 180));
		return vec;
	}

	/**
	 * Returns the distance a projectile travels in 1ms.
	 */
	getSpeed() {
		return (this.data.speed / 10000 + (this.accelerationSpeed / 1000)) * this.speedBoost;
	}

	getLifetime() {
		return this.data.lifetime * this.lifeBoost
	}

	// getVerts(sprite: GLSprite | undefined) {
	// 	if (this.verts.length !== 0) {
	// 		return this.verts;
	// 	}
	// 	return super.getVerts(sprite);
	// }

	// coordsFromSprite(sprite: GLSprite) {
	// 	if (this.texVerts.length !== 0) {
	// 		return this.texVerts;
	// 	}
	// 	return super.
	// }

	update(elapsed: number) {
		this._currLifetime += elapsed;
		if (this._currLifetime > this.data.lifetime) {
			this.delete();
		}

		if (this.data.acceleration !== 0 && this._currLifetime > this.data.accelerationDelay) {
			this.accelerationSpeed += (this.data.acceleration / 10000) * elapsed;
			if (this.data.speedClamp !== undefined) {
				if (this.data.acceleration <= 0 && (this.data.speed / 10000) + this.accelerationSpeed < this.data.speedClamp / 10000) {
					this.accelerationSpeed = (this.data.speedClamp - (this.data.speed)) / 10;
				}
				if ((this.data.speed / 10000) + (this.accelerationSpeed ) >= this.data.speedClamp / 10000) {
					this.accelerationSpeed = (this.data.speedClamp - (this.data.speed)) / 10;
				}
			}
		}

		if (this.data.parametric) return;

		if (this.data.circleTurnAngle !== undefined && this.data.circleTurnDelay !== undefined) {
			if (this._currLifetime >= this.data.circleTurnDelay) {
				if (!this._circleTurned) {
					this.angle += this.data.circleTurnAngle;
					this._circleTurned = true;
				}
				//TODO: learn math
				const speed = this.getSpeed();
				const radius = this.data.circleTurnDelay * speed;
				const dist = speed * elapsed;
				this.angle += (90 - (Math.PI * 10)) / (radius / dist);
			}
		}
		
		let moveVec = new Vec2(this.getSpeed() * elapsed, 0);
		if (this.data.boomerang && this._currLifetime > this.data.lifetime / 2) {
			moveVec = moveVec.mult(new Vec2(-1, -1));
		}
		// (document.getElementById("test") as HTMLElement).innerText = moveVec.toString()
		this.move(moveVec.rotate(this.angle * (Math.PI / 180)));
	}

	getRenderRect() {
		return Rect.Zero.expand(0.8, 0.8);
	}

	getRenderAngle() {
		let baseAngle = this.angle + 180 + (this.renderData?.angleCorrection !== undefined ? -this.renderData.angleCorrection * 45 : 0);

		return baseAngle + (this.renderData?.rotation !== undefined ? this.renderData.rotation * (this._currLifetime / 1000) : 0);
	}

	getModelViewMatrix() {
		const mat = super.getModelViewMatrix();
		if (this.data.size !== 100) {
			const scale = this.data.size / 100;
			mat4.scale(mat, mat, [scale, scale, 1])
		}
		// mat4.rotateZ(mat, mat, (-this.angle - (this.renderData?.angleCorrection === 1 ? 45 : 0)) * (Math.PI / 180));
		return mat;
	}

	getSprite() {
		if (this.renderData === undefined) return undefined;
		if (this.sprite !== undefined) return this.sprite; 
		const sprite = (this.getGame() as RotMGGame).renderHelper?.getSpriteFromObject(this.renderData, {
			time: this._currLifetime
		})
		if (!(this.renderData.texture instanceof AnimatedTexture)) {
			this.sprite = sprite;
		}
		return sprite;
	}

	getProgram(manager: AssetManager) {
		return manager.get<WebGLProgram>("programs", "textured")?.value;
	}
}