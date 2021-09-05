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
}

export default class NovaEffect extends GameObject {
	colors: Color[]
	lifetime: number
	range: number
	cycles: number
	time: number = 0;

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

		this._interval = this.lifetime / this.cycles;
	}

	canCollideWith() {
		return false;
	}

	update(elapsed: number) {
		this.time += elapsed;

		while (this._lastCycleTime + this._interval < this.time) {
			for (let i = 0; i < 14; i++) {
				const angle = Math.PI * 2 * (i / 14);
				const dist = this.range * (this._currentCycle / this.cycles);
				const pos = new Vec2(0, dist).rotate(angle).add(this.position);

				this.scene?.addObject(new Particle({
					color: Color.Red,
					lifetime: 500,
					target: pos,
					delta: Vec2.random(true).toVec3(0)
				}))
			}
			console.log(this._currentCycle)
			this._currentCycle++;
			this._lastCycleTime += this._interval;
		}
		if (this.time > this.lifetime) {
			this.delete()
		}
	}
}