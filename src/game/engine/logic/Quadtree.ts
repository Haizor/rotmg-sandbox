import GameObject from "../obj/GameObject";
import Rect from "./Rect";

export default class Quadtree {
	maxObjects: number = 10;
	maxLevels: number = 10;

	level: number;
	objects: GameObject[] = [];
	bounds: Rect;
	nodes: Quadtree[] = [];

	constructor(level: number, bounds: Rect) {
		this.level = level;
		this.bounds = bounds;
	}

	clear() {
		this.objects = [];
		for (let node of this.nodes) {
			node.clear();
		}
		this.nodes = [];
	}

	split() {
		let sW = this.bounds.w / 2;
		let sH = this.bounds.h / 2;
		let x = this.bounds.x;
		let y = this.bounds.y;

		this.nodes[0] = new Quadtree(this.level - 1, new Rect(x + sW, y, sW, sH));
		this.nodes[1] = new Quadtree(this.level - 1, new Rect(x, y, sW, sH));
		this.nodes[2] = new Quadtree(this.level - 1, new Rect(x, y + sH, sW, sH));
		this.nodes[1] = new Quadtree(this.level - 1, new Rect(x + sW, y + sH, sW, sH));
	}

	getIndex(rect: Rect): number {
		let index = -1;

		let verticalMidpoint = this.bounds.x + (this.bounds.w / 2);
		let horizontalMidpoint = this.bounds.y + (this.bounds.h / 2);

		let fitsInTop = (rect.y + rect.h < horizontalMidpoint);
		let fitsInBottom = (rect.y > horizontalMidpoint);

		if (rect.x + rect.w > verticalMidpoint) {
			if (fitsInTop) index = 1;
			if (fitsInBottom) index = 2;
		} else if (rect.x > verticalMidpoint) {
			if (fitsInTop) index = 0;
			if (fitsInBottom) index = 3;
		}

		return index;
	}

	insert(obj: GameObject) {
		const rect = obj.getCollisionBox();

		if (this.nodes[0] !== undefined) {
			let index = this.getIndex(rect);

			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		} 

		this.objects.push(obj);

		if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
			if (this.nodes[0] === undefined) {
				this.split();
			}

			let i = 0;
			while (i < this.objects.length) {
				let index = this.getIndex(this.objects[i].getCollisionBox());
				if (index !== -1) {
					this.nodes[index].insert(this.objects.splice(i, 1)[0] as GameObject);
				} else {
					i++;
				}
			}
		}
	}

	retrieve(rect: Rect, objects: GameObject[] = []) {
		let index = this.getIndex(rect);
		if (index !== -1 && this.nodes[0] != null) {
			this.nodes[index].retrieve(rect, objects);
		}

		objects.push(...this.objects);

		return objects;
	}
}