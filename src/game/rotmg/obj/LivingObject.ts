import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import RenderInfo from "game/engine/RenderInfo";
import StatusEffect from "../effects/StatusEffect";
import { DamageSource } from "./DamageSource";
import DamageText from "./DamageText";
import RotMGObject from "./RotMGObject";

export default class LivingObject extends RotMGObject {
	private hp: number;
	private maxHp: number = 1000;
	private defense: number = 0;

	private statusEffects: Map<StatusEffectType, StatusEffect> = new Map();

	constructor() {
		super();
		this.hp = this.maxHp;
	}

	update(elapsed: number) {
		super.update(elapsed);
		for (const effect of this.statusEffects.values()) {
			effect.update(this, elapsed);
		}
	}

	getDefense() {
		return this.defense;
	}

	damage(source: DamageSource<any>): boolean {
		const amount = source.amount;
		const dmg = source.ignoreDef ? amount : Math.max(amount - this.getDefense(), Math.floor(amount * 0.1));
		source.amount = dmg;
		if (this.setHealth(this.getHealth() - dmg)) {
			this.onDamaged(source);
		}

		if (this.hp < 0) {
			this.kill();
		}

		return true;
	}

	heal(amount: number): boolean {
		if (this.setHealth(this.getHealth() + amount)) {
			this.onHealed(amount);
		}
		return true;
	}

	onDamaged(source: DamageSource<any>) {
		this.scene?.addObject(new DamageText(this, source));
	}

	onHealed(amount: number) {}

	onDeath() {}

	getHealth() {
		return this.hp;
	}

	getMaxHealth() {
		return this.maxHp;
	}

	setHealth(health: number) {
		const prevHealth = this.getHealth();
		this.hp = Math.min(this.getMaxHealth(), health)
		return this.hp !== prevHealth;
	}

	setMaxHealth(maxHealth: number) {
		this.maxHp = maxHealth;
		this.setHealth(Math.min(this.getMaxHealth(), this.hp));
	}

	addStatusEffect(effect: StatusEffect) {
		const type = effect.getID();
		if (!this.hasStatusEffect(type)) {
			this.statusEffects.set(type, effect);
			effect.onApply(this);
		} else {
			(this.statusEffects.get(type) as StatusEffect).duration = effect.duration;
		}
	}

	hasStatusEffect(effect: StatusEffectType) {
		return this.statusEffects.has(effect);
	}

	removeStatusEffect(effect: StatusEffectType) {
		this.statusEffects.get(effect)?.onRemove?.(this);
		this.statusEffects.delete(effect);
	}

	kill() {
		this.onDeath();
		this.delete();
	}

	getBarBackColor() {
		return new Color(0, 0, 0, 1)
	}

	render(info: RenderInfo) {
		super.render(info);

		const { gl, manager } = info;
		const hpBarProgram = this.getAssetManager()?.get<WebGLProgram>("programs", "billboard/color")?.value;

		if (hpBarProgram === undefined || this.scene === null) return;
		

		gl.useProgram(hpBarProgram);
		gl.uniformMatrix4fv(
			gl.getUniformLocation(hpBarProgram, "uProjectionMatrix"),
			false,
			this.scene.camera.getProjectionMatrix()
		);
		gl.uniformMatrix4fv(
			gl.getUniformLocation(hpBarProgram, "uViewMatrix"),
			false,
			this.scene.camera.getViewMatrix()
		);

		const hpBarSize = new Vec2(1.4, 0.3);
		const yOffset = 0.9;
		const hpRatio = this.getHealth() / this.getMaxHealth();

		const posBuffer = manager.bufferManager.getBuffer();
		const back = Rect.Zero.expand(hpBarSize).translate(0, yOffset);
		const bar = Rect.Zero.expand(0, hpBarSize.y - 0.1).addSize((-(hpBarSize.x - 0.1) * hpRatio), 0).translate((hpBarSize.x - 0.1) / 2, yOffset);

		const verts = back.toVerts(false);
		const barVerts = bar.toVerts(false);

		const barColor = Color.lerp(new Color(0, 1, 0, 1), new Color(1, 0, 0, 1), hpRatio);

		const draw = (verts: number[], color: Color) => {
			if (hpBarProgram === undefined) return;

			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
			gl.vertexAttribPointer(
				gl.getAttribLocation(hpBarProgram, "aVertexPosition"),
				2,
				gl.FLOAT,
				false,
				0,
				0
			)
			gl.enableVertexAttribArray(gl.getAttribLocation(hpBarProgram, "aVertexPosition"))
	
			gl.uniformMatrix4fv(gl.getUniformLocation(hpBarProgram, "uModelViewMatrix"), false, this.getModelViewMatrix());
			gl.uniform4f(gl.getUniformLocation(hpBarProgram, "uColor"), color.r, color.g, color.b, color.a);
			{
				const offset = 0;
				const vertexCount = 4;
				gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
			}
		}

		draw(verts, this.getBarBackColor());
		draw(Rect.Zero.expand(hpBarSize.x - 0.1, hpBarSize.y - 0.1).translate(0, yOffset).toVerts(false), Color.Black)
		draw(barVerts, barColor)

		manager.bufferManager.finish();
	}

	getParticleColor() {
		return Color.Red;
	}
}