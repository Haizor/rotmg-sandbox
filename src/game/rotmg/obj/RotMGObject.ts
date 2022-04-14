import Vec2 from "game/engine/logic/Vec2";
import Vec3 from "game/engine/logic/Vec3";
import { mat4 } from "gl-matrix";
import { XMLObject, TextureProvider, Action, Direction, ObjectClass, AssetManager, Sprite } from "rotmg-utils";
import Color from "../../engine/logic/Color";
import Rect from "../../engine/logic/Rect";
import GameObject from "../../engine/obj/GameObject";
import RenderInfo from "../../engine/RenderInfo";
import { RenderHelper } from "../RenderHelper";
import type RotMGGame from "../RotMGGame";

export default class RotMGObject<T extends XMLObject = XMLObject> extends GameObject {
	flipSprite: boolean = false;
	tint: Color = new Color(1.0, 1.0, 1.0, 1.0);
	outlineSize: number = 0.005;
	time: number = 0;
	xmlData?: T;
	texture?: TextureProvider;
	action: Action = Action.Walk;
	direction: Direction = Direction.Side;
	animated: boolean = false;
	frameSwitchDelay: number = -1;
	movementDelta: Vec2 = Vec2.Zero;
	sprites: Sprite[] = [];
	scaleDownSprite: boolean = false;


	private _lastServerUpdate = 0;
	private _lastPos: Vec2 = Vec2.Zero;

	constructor(data?: T) {
		super();
		this.z = 1;
		this.xmlData = data;
	}

	onAddedToScene(): void {
		this.updateSprites();
	}

	getGame() {
		return super.getGame() as RotMGGame | undefined;
	}

	updateSprites(): void {
		const game = this.getGame();
		if (game === undefined || game.renderHelper === undefined) return;
		this.sprites = game.renderHelper.getSpritesFromObject(this.xmlData);
	}

	canCollideWith(obj: GameObject) {
		if (this.xmlData !== undefined && this.xmlData.class === ObjectClass.GameObject) {
			return false;
		}
		return super.canCollideWith(obj);
	}

	update(elapsed: number) {
		this.time += elapsed;
		if (this._lastServerUpdate + 200 < this.time) {
			this.serverUpdate();
			this._lastServerUpdate = this.time;
		}
	}

	serverUpdate() {
		this.movementDelta = this.position.subtract(this._lastPos);
		this._lastPos = this.position;
	}

	getVerts(ratio: Vec2 = Vec2.One, scale: Vec2 = Vec2.One): number[] {
		let rect = this.getRenderRect().expandMult(scale.x, scale.y).expandMult(ratio.x, ratio.y);

		if (ratio.x !== ratio.y) {
			rect.x -= this.flipSprite ? ratio.x / 4 : -ratio.x / 4;
		}

		return rect.toVerts(this.flipSprite);
	}

	getSpriteVerts(sprite: Sprite) {
		const data = sprite.getData();
		const { x, y, w, h } = data.position;
		return [
			x, y,
			x + w, y,
			x + w, y + h,
			x, y + h
		]
	}
	
	render(renderInfo: RenderInfo) {
		const sprite = this.getSprite();
		if (sprite === undefined) return;

		const { gl, programInfo } = renderInfo;
		const { attribs, uniforms, program } = programInfo;
		const helper = this.getGame()?.renderHelper as RenderHelper;

		const { w, h } = sprite.getData().position;

		const sizeMult = !this.scaleDownSprite ? new Vec2(w / 8, h / 8) : Vec2.One;

		const texture = helper.getTexture(sprite.getData().aId);

		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		gl.useProgram(program);

		gl.uniformMatrix4fv(uniforms["uModelViewMatrix"], false, this.getModelViewMatrix());
		gl.uniform2f(uniforms["uTextureRes"], 4096, 4096);
		gl.uniform4f(uniforms["uColor"], Color.White.r, Color.White.g, Color.White.b, Color.White.a);

		const verts = attribs["aVertexPosition"];
		gl.bindBuffer(gl.ARRAY_BUFFER, verts.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getVerts(new Vec2(w /  h, 1), sizeMult)), gl.STATIC_DRAW);
		gl.vertexAttribPointer(verts.location, 2, gl.FLOAT, false, 0, 0);

		const texCoord = attribs["aTextureCoord"];
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoord.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getSpriteVerts(sprite)), gl.STATIC_DRAW);
		gl.vertexAttribPointer(texCoord.location, 2, gl.FLOAT, false, 0, 0);

		const draw = (color: Color, offset: Vec3 = Vec3.Zero) => {
			gl.uniform3f(uniforms["uOffset"], offset.x, offset.y, offset.z);
			gl.uniform4f(uniforms["uColor"], color.r, color.g, color.b, color.a);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		const ratio = (gl.canvas.width / gl.canvas.height)

		const oColor = Color.Black;
		oColor.a = this.tint.a !== 1.0 ? 0.5 : 1;

		draw(oColor, new Vec3(-this.outlineSize / ratio, this.outlineSize, 0.0001));
		draw(oColor, new Vec3(-this.outlineSize / ratio, -this.outlineSize, 0.0001));		
		draw(oColor, new Vec3(this.outlineSize / ratio, -this.outlineSize, 0.0001));		
		draw(oColor, new Vec3(this.outlineSize / ratio, this.outlineSize, 0.0001));
		draw(this.tint);
	}

	getSprite(): Sprite | undefined {
		return this.sprites[0];
	}

	getModelViewMatrix(): mat4 {
		const mat = mat4.create();

		mat4.translate(mat, mat, [this.position.x, this.position.y, this.z])
		mat4.scale(mat, mat, [0.8, 0.8, 1]);
		mat4.rotateZ(mat, mat, this.getRenderAngle() * Math.PI / 180)

		return mat;
	}

	getRenderAngle(): number {
		return 0;
	}

	getRenderRect(): Rect {
		return Rect.Zero.expand(1, 1);
	}

	getParticleProb(): number {
		return 1;
	}

	getCollisionBox() {
		return Rect.Zero.expand(0.8, 0.8);
	}

	getCollisionTags() {
		return ["player", "wall", "enemy"]
	}

	getProgram(manager: AssetManager): WebGLProgram | undefined {
		return manager.get<WebGLProgram>("programs", "billboard")?.value;
	}

	getProgramName() {
		return "billboard";
	}
}