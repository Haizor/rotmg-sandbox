import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import Vec3 from "game/engine/logic/Vec3";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import StatusEffect, { HealingStatusEffect } from "../effects/StatusEffect";
import RotMGGame from "../RotMGGame";
import { DamageSource } from "./DamageSource";
import DamageText from "./DamageText";
import Particle from "./Particle";
import RotMGObject from "./RotMGObject";

export default class LivingObject extends RotMGObject {
	private hp: number;
	private maxHp: number = 1000;
	private defense: number = 0;

	public speedMultiplier = 1;

	private statusEffects: Map<StatusEffectType, StatusEffect> = new Map();

	constructor() {
		super();
		this.hp = this.maxHp;
	}

	update(elapsed: number) {
		super.update(elapsed);
		for (const effect of this.statusEffects.values()) {
			effect.time += elapsed;
			if (effect.time > effect.duration) {
				this.removeStatusEffect(effect.getID())
			}

			switch (effect.getID()) {
				case StatusEffectType.Healing:
					const healing = effect as HealingStatusEffect
					if (healing.lastParticleTime + 250 < effect.time) {
						const particle = new Particle({
							target: this, 
							offset: Vec2.random(true),
							scale: Math.random() + 0.5,
							lifetime: 500, 
							color: Color.White, 
							delta: new Vec3(0, 0, 2)});
						this.getScene()?.addObject?.(particle);
						healing.lastParticleTime = healing.time;
					}
					if (!this.hasStatusEffect(StatusEffectType.Sick)) {
						this.heal((20 / 1000) * elapsed);
					}
					break;
			}
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
			this.onStatusEffectApplied(effect);
		} else {
			(this.statusEffects.get(type) as StatusEffect).duration = effect.duration;
		}
	}

	onStatusEffectApplied(effect: StatusEffect) {
		switch (effect.getID()) {
			case StatusEffectType.Speedy:
				this.speedMultiplier = 1.5
				break;
		}
	}
	onStatusEffectRemoved(effect: StatusEffect) {
		switch (effect.getID()) {
			case StatusEffectType.Speedy:
				this.speedMultiplier = 1
				break;
		}
	}

	hasStatusEffect(effect: StatusEffectType) {
		return this.statusEffects.has(effect);
	}

	removeStatusEffect(type: StatusEffectType) {
		const effect = this.statusEffects.get(type);
		if (effect !== undefined) {
			this.onStatusEffectRemoved(effect);
			this.statusEffects.delete(type);
		}
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
		this.renderHPBar(info);
		this.renderStatusEffects(info);		
	}

	renderHPBar(info: RenderInfo) {
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

	renderStatusEffects(info: RenderInfo) {
		if (this.statusEffects.size <= 0) return;

		const { gl, manager } = info;
		const program = this.getAssetManager()?.get<WebGLProgram>("programs", "billboard")?.value;

		if (program === undefined || this.scene === null) return;

		gl.useProgram(program);
		gl.uniformMatrix4fv(
			gl.getUniformLocation(program, "uProjectionMatrix"),
			false,
			this.scene.camera.getProjectionMatrix()
		);
		gl.uniformMatrix4fv(
			gl.getUniformLocation(program, "uViewMatrix"),
			false,
			this.scene.camera.getViewMatrix()
		);

		const posBuffer = manager.bufferManager.getBuffer();
		const textureBuffer = manager.bufferManager.getBuffer();

		const start = -this.statusEffects.size / 2 + 0.4

		const draw = (effect: StatusEffect, index: number) => {
			const verts = Rect.Zero.expand(0.35, 0.35).translate(0.40 * (start + index), -0.9).toVerts(false);
			const sprite = (this.getGame() as RotMGGame).renderHelper?.getSpriteFromTexture(effect.getTexture());
			if (sprite === undefined) return;

			const textureVerts = this.coordsFromSprite(sprite);

			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
			gl.vertexAttribPointer(
				gl.getAttribLocation(program, "aVertexPosition"),
				2,
				gl.FLOAT,
				false,
				0,
				0
			)
			gl.enableVertexAttribArray(gl.getAttribLocation(program, "aVertexPosition"));

			gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVerts), gl.STATIC_DRAW);
			gl.vertexAttribPointer(gl.getAttribLocation(program, "aTextureCoord"), 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(gl.getAttribLocation(program, "aTextureCoord"))
	
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, sprite.texture.texture)
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 1);

			const innerDraw = (matrix: mat4, color: Color, offset: Vec3 = Vec3.Zero) => {
				gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, matrix);
				gl.uniform3f(gl.getUniformLocation(program, "uOffset"), offset.x, offset.y, offset.z);
				gl.uniform4f(gl.getUniformLocation(program, "uColor"), color.r, color.g, color.b, color.a);
	
				{
					const offset = 0;
					const vertexCount = 4;
					gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
				}
			}

			let matrix = mat4.create()
			mat4.translate(matrix, matrix, [this.position.x, this.position.y, this.z])
			const ratio = (gl.canvas.width / gl.canvas.height)

			innerDraw(matrix, Color.Black, new Vec3(-this.outlineSize / ratio, this.outlineSize, 0.0001));
			innerDraw(matrix, Color.Black, new Vec3(-this.outlineSize / ratio, -this.outlineSize, 0.0001));
			innerDraw(matrix, Color.Black, new Vec3(this.outlineSize / ratio, -this.outlineSize, 0.0001));
			innerDraw(matrix, Color.Black, new Vec3(this.outlineSize / ratio, this.outlineSize, 0.0001));
			innerDraw(matrix, Color.White);
		}

		let i = 0;
		for (const effect of this.statusEffects) {
			draw(effect[1], i);
			i++;
		}

		manager.bufferManager.finish();
	}

	getParticleColor() {
		return Color.Red;
	}
}