import Color from "game/engine/logic/Color";
import Vec2 from "game/engine/logic/Vec2";
import GameObject from "game/engine/obj/GameObject";
import Particle from "./Particle";

export type NovaEffectOptions = {
	colors: Color[],
	lifetime: number,
	range: number,
	cycles: number;
	target: Vec2;
	z?: number;
	reversed?: boolean;
}

export default class NovaEffect extends GameObject {
	colors: Color[]
	lifetime: number
	range: number
	cycles: number
	time: number = 0;
	reversed: boolean = false;

	private _lastCycleTime = 0;
	private _currentCycle = 0;
	private _interval;

	constructor(options: NovaEffectOptions) {
		super()
		this.colors = options.colors;
		this.lifetime = options.lifetime;
		this.range = options.range;
		this.cycles = options.cycles;
		this.position = options.target;
		this.z = options.z ?? 0;
		this.reversed = options.reversed ?? false;

		this._interval = this.lifetime / this.cycles;
	}

	canCollideWith() {
		return false;
	}

	update(elapsed: number) {
		this.time += elapsed;

		while (this._lastCycleTime + this._interval < this.time) {
			if (this._currentCycle > this.cycles) {
				break;
			}

			for (const color of this.colors) {
				for (let i = 0; i < 14; i++) {
					const angle = Math.PI * 2 * (i / 14);
					let cycleMod = (this._currentCycle / this.cycles);
					if (this.reversed) cycleMod = Math.abs(cycleMod - 1)
					const dist = this.range * cycleMod;
					const pos = new Vec2(0, dist).rotate(angle).add(this.position);
	
					const particle = new Particle({
						color,
						lifetime: 500,
						target: pos,
						delta: Vec2.random(true).toVec3(0)
					})

					particle.z = this.z;

					this.scene?.addObject(particle);
				}
			}

			this._currentCycle++;
			this._lastCycleTime += this._interval;
		}
		if (this.time > this.lifetime) {
			this.delete()
		}
	}
}