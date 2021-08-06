import Vec2 from "./Vec2";

export default class Rect {
	public pos: Vec2 = new Vec2(0, 0);
	public size: Vec2 = new Vec2(0, 0);

	public get x() { return this.pos.x; }
	public get y() { return this.pos.y; }
	public get w() { return this.size.x; }
	public get h() { return this.size.y; }

	public set x(x) { this.pos.x = x; }
	public set y(y) { this.pos.y = y; }
	public set w(w) { this.size.x = w; }
	public set h(h) { this.size.y = h; }

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	copy() {
		return new Rect(this.x, this.y, this.w, this.h);
	}

	intersects(rect: Rect): boolean {
		if (this.x <= rect.x + rect.w && 
			this.x + this.w >= rect.x && 
			this.y <= rect.y + rect.h && 
			this.y + this.h >= rect.y) {

			return true;
		}
		return false;
	}

	toString() {
		return `Rect[x=${this.x},y=${this.y},w=${this.w},h=${this.h}]`
	}
}