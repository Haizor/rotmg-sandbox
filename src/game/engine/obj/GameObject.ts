import { AssetManager } from "rotmg-utils";
import Color from "../logic/Color";
import Rect from "../logic/Rect";
import Scene from "../logic/Scene";
import Vec2 from "../logic/Vec2";
import RenderInfo from "../RenderInfo";

export enum RenderPriority {
	Low, 
	Medium,
	High
}

export default class GameObject {
	z: number = 0;
	get position(): Vec2 {
		return this._position;
	}
	set position(pos: Vec2) {
		this._position = pos;
	}
	color: Color;
	id: number;
	renderPriority: RenderPriority = RenderPriority.Medium;
	protected scene: Scene | null;
	protected _position = Vec2.Zero;
	private _tags: string[] = [];
	
	constructor() {
		this.scene = null;
		this.position = new Vec2(0, 0);
		this.color = new Color(1, 0, 0, 1);
		this.id = -1;
	}

	hasTag(tag: string) {
		return this._tags.includes(tag);
	}

	addTag(tag: string) {
		if (!this.hasTag(tag)) {
			this._tags.push(tag);
		}
	}

	removeTag(tag: string) {
		this._tags = this._tags.filter((t) => t !== tag);
	}

	getTags(): string[] {
		return this._tags;
	}

	setScene(scene: Scene) {
		this.scene = scene;
		this.onAddedToScene();
	}

	delete() {
		if (this.scene === null) {
			return false;
		}
		this.onDeleted();
		return this.scene.deleteObject(this);
	}

	onAddedToScene() {} 
	onCollision(obj: GameObject) { }

	getCollisionBox() : Rect {
		return Rect.Zero.expand(1, 1);
	}

	getScene(): Scene | null {
		return this.scene;
	}

	canMoveTo(newPos: Vec2): boolean {
		if (this.scene === null) {
			return true;
		}

		const objs = this.getCollisionTags().flatMap((s) => (this.scene as Scene).getObjectsWithTag(s))
		for (const obj of objs) {
			if (this.canCollideWith(obj) && obj.canCollideWith(this)) {
				if (this.collidesWith(newPos, obj) || obj.collidesWith(obj.position, this)) {
					this.onCollision(obj);
					obj.onCollision(this);
					return !obj.preventsMovement();
				}
			}
		}
		return true;
	}

	getCollisionTags(): string[] {
		return [];
	}

	collidesWith(newPos: Vec2, object: GameObject) {
		const rect = this.getCollisionBox().copy();
		rect.pos = newPos.add(rect.pos);
		const otherRect = object.getCollisionBox().copy();
		otherRect.pos = object.position.add(otherRect.pos);
		return this.getCollisionBox().translate(newPos).intersects(object.getCollisionBox().translate(object.position));
	}

	canCollideWith(object: GameObject) {
		return object !== this;
	}

	preventsMovement(): boolean {
		return true;
	}

	move(vec: Vec2) {
		this.updatePosition(new Vec2(vec.x, 0));
		this.updatePosition(new Vec2(0, vec.y));
	}

	moveTowards(vec: Vec2, mult: number) {
		const dir = this.position.subtract(vec).normalize();
		this.move(dir.mult(new Vec2(-mult, -mult)));
	}

	updatePosition(vec: Vec2): boolean {
		if (this.canMoveTo(this.position.add(vec))) {
			this._position = this._position.add(vec);
			return true;
		}
		return false;
	}

	update(elapsed: number) {}

	render(info: RenderInfo) {}

	getGame() {
		return this.scene?.game;
	}

	getAssetManager() {
		return this.getGame()?.assetManager;
	}

	onDeleted() {

	}

	getProgramName(): string | undefined {
		return undefined;
	}
}