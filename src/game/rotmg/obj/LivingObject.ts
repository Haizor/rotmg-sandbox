import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import RenderInfo from "game/engine/RenderInfo";
import DamageText from "./DamageText";
import RotMGObject from "./RotMGObject";

export default class LivingObject extends RotMGObject {
	private hp: number;
	private maxHp: number = 1000;
	private defense: number = 0;

	constructor() {
		super();
		this.hp = this.maxHp;
	}

	getDefense() {
		return this.defense;
	}

	damage(amount: number): boolean {
		const dmg = Math.max(amount - this.getDefense(), Math.floor(amount * 0.1));
		if (this.setHealth(this.hp - dmg)) {
			this.onDamaged(dmg);
		}

		if (this.hp < 0) {
			this.kill();
		}

		return true;
	}

	onDamaged(amount: number) {
		this.scene?.addObject(new DamageText(this.position, amount));
	}


	onDeath() {}

	getHealth() {
		return this.hp;
	}

	getMaxHealth() {
		return this.maxHp;
	}

	setHealth(health: number) {
		const prevHealth = this.hp;
		this.hp = Math.min(this.maxHp, health)
		return this.hp !== prevHealth;
	}

	setMaxHealth(maxHealth: number) {
		this.maxHp = maxHealth;
		this.hp = Math.min(this.maxHp, this.hp);
	}

	kill() {
		this.onDeath();
		this.delete();
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
		const hpRatio = this.hp / this.maxHp;

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

		draw(verts, new Color(0, 0, 0, 1));
		draw(barVerts, barColor)

		manager.bufferManager.finish();
	}
}