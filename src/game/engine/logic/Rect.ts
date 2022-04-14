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

	public static get Zero() {
		return new Rect(0, 0, 0, 0);
	}

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	copy(): Rect {
		return new Rect(this.x, this.y, this.w, this.h);
	}

	expand(vec: Vec2): Rect;
	expand(x: number, y: number): Rect;
	expand(x: any, y?: number): Rect {
		if (x instanceof Vec2) {
			return new Rect(this.x - (x.x / 2), this.y - (x.y / 2), x.x + this.w, x.y + this.h);
		} else if (y !== undefined)
			return new Rect(this.x - (x / 2), this.y - (y / 2), this.w + x, this.h + y);
		return Rect.Zero;
	}

	expandMult(x: number, y: number): Rect {
		const w = this.w * x;
		const h = this.h * y;
		return new Rect(-(w / 2), -(h / 2), w, h);
	}

	addSize(x: number, y: number): Rect {
		return new Rect(this.x, this.y, this.w + x, this.h + y);
	}

	translate(vec: Vec2): Rect;
	translate(x: number, y: number): Rect;
	translate(x: any, y?: number): Rect {
		if (x instanceof Vec2) {
			return new Rect(this.x + x.x, this.y + x.y, this.w, this.h);
		} else if (y !== undefined) {
			return new Rect(this.x + x, this.y + y, this.w, this.h);
		}
		return Rect.Zero;
	}

	intersects(rect: Rect): boolean {
		if (this.x < rect.x + rect.w && 
			this.x + this.w > rect.x && 
			this.y < rect.y + rect.h && 
			this.y + this.h > rect.y) {

			return true;
		}
		return false;
	}

	contains(point: Vec2) {
		return (point.x > this.x && point.x < this.x + this.w) && (point.y > this.y && point.y < this.y + this.h);
	}

	toVerts(flip: boolean): number[] {
		if (flip) {
			return [
				this.x + this.w, this.y,
				this.x, this.y,
				this.x, this.y + this.h, 
				this.x + this.w, this.y + this.h
			]
		}
		return [
			this.x, this.y,
			this.x + this.w, this.y,
			this.x + this.w, this.y + this.h,
			this.x, this.y + this.h
		]
	}

	toTriangles(): number[] {
		return [
			this.x, this.y + this.h,
			this.x, this.y,
			this.x + this.w, this.y + this.h,
			this.x, this.y,
			this.x + this.w, this.y + this.h,
			this.x + this.w, this.y
		]
	}

	toString() {
		return `Rect[x=${this.x},y=${this.y},w=${this.w},h=${this.h}]`
	}
}