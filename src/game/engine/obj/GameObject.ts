import AssetManager from "../asset/AssetManager";
import Color from "../logic/Color";
import Rect from "../logic/Rect";
import Scene from "../logic/Scene";
import Vec2 from "../logic/Vec2";
import RenderInfo from "../RenderInfo";
import GLTextureInfo from "../webgl/GLTextureInfo";

export interface GLSprite {
	texture: GLTextureInfo
	rect: Rect
}

export enum RenderPriority {
	Low, 
	Medium,
	High
}

export default class GameObject {
	rect: Rect;
	z: number = 0;
	get position() { return this.rect.pos; }
	set position(pos) { this.rect.pos = pos; }
	color: Color;
	id: number;
	renderPriority: RenderPriority = RenderPriority.Medium;
	protected scene: Scene | null;
	
	constructor() {
		this.scene = null;
		this.rect = new Rect(0, 0, 1, 1);
		this.position = new Vec2(0, 0);
		this.color = new Color(1, 0, 0, 1);
		this.id = -1;
	}

	setScene(scene: Scene) {
		this.scene = scene;
		this.onAddedToScene();
	}

	delete() {
		if (this.scene === null) {
			return false;
		}
		return this.scene.objects.delete(this.id);
	}

	onAddedToScene() {} 
	onCollision(obj: GameObject) { }

	canMoveTo(newPos: Vec2): boolean {
		if (this.scene === null) {
			return true;
		}
		for (const obj of this.scene.objects.values()) {
			if (this.collidesWith(obj)) {
				const rect = this.rect.copy();
				rect.pos = newPos;
				if (rect.intersects(obj.rect)) {
					this.onCollision(obj);
					obj.onCollision(this);
					return !obj.preventsMovement();
				}
			}
		}
		return true;
	}

	collidesWith(object: GameObject) {
		return object !== this;
	}

	preventsMovement(): boolean {
		return true;
	}

	move(vec: Vec2) {
		this.updatePosition(this.position.add(vec));
	}

	updatePosition(newPos: Vec2): boolean {
		if (this.canMoveTo(newPos)) {
			this.position = newPos;
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

	getProgram(manager: AssetManager): WebGLProgram | undefined {
		return undefined;
	}
}