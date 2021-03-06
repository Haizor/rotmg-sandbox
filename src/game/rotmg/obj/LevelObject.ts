import Color from "game/engine/logic/Color";
import Rect from "game/engine/logic/Rect";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import { Ground, Sprite } from "@haizor/rotmg-utils";
import { RenderHelper } from "../RenderHelper";
import RotMGGame from "../RotMGGame";
import RotMGObject from "./RotMGObject";

export type MapCoord = {
	x: number,
	y: number
}

export class CoordinateMap<T> {
	private _map: Map<string, T> = new Map();

	get(coord: MapCoord) {
		return this._map.get(`${coord.x},${coord.y}`)
	}

	set(coord: MapCoord, value: T) {
		return this._map.set(`${coord.x},${coord.y}`, value)
	}

	has(coord: MapCoord) {
		return this._map.has(`${coord.x},${coord.y}`)
	}

	forEach(callback: (value: [MapCoord, T]) => void) {
		this._map.forEach((value, key) => {
			callback([this.stringToCoord(key), value]);
		})
	}

	values() {
		return this._map.values();
	}

	private stringToCoord(str: string) {
		const split = str.split(",");
		return {x: Number(split[0]), y: Number(split[1])}
	}

	[Symbol.iterator]() {
		return this._map.entries();
	}
}

export class LevelChunk {
	static readonly chunkSize: number = 16 * 16;
	static readonly vertsPerTile: number = 12;
	static readonly chunkVertSize: number = LevelChunk.chunkSize * LevelChunk.vertsPerTile;
	private _verts: Float32Array = new Float32Array(LevelChunk.chunkVertSize);
	private _textureVerts: Float32Array = new Float32Array(LevelChunk.chunkVertSize);
	private _tiles: Ground[] = [];

	private _vertsBuffer?: WebGLBuffer;
	private _textureVertsBuffer?: WebGLBuffer;

	private _needsRebuild: boolean = false;

	coord: MapCoord;

	constructor(coord: MapCoord) {
		this.coord = coord;
	}

	set(coord: MapCoord, tile: Ground, helper: RenderHelper) {
		const localCoord = this.toLocal(coord);

		let i = (localCoord.y + (localCoord.x * 16)) * LevelChunk.vertsPerTile;
		this._tiles[i / LevelChunk.vertsPerTile] = tile;
		const verts = Rect.Zero.expand(1.01, 1.01).translate(localCoord.x, localCoord.y).toTriangles();
		const textureVerts = this.getTextureVertsFromTile(tile, helper);
		for (let z = 0; z < LevelChunk.vertsPerTile; z++) {
			this._verts[i] = verts[z];
			this._textureVerts[i] = textureVerts[z];
			i++;
		}

		this._needsRebuild = true;
	}

	toLocal(coord: MapCoord) {
		return { x: Math.abs(coord.x % 16), y: Math.abs(coord.y % 16) }
	}

	getVerts(): Float32Array {
		return this._verts;
	}

	getTextureVerts(): Float32Array {
		return this._textureVerts;
	}

	getTextureVertsFromTile(tile: Ground, helper: RenderHelper) {
		const sprite = helper.getSpriteFromTexture(tile.texture);
		if (sprite === undefined) return [0, 0, 0, 0, 0, 0, 0, 0];
		const { x, y, w, h } = sprite.getData().position;
		return [
			x, y + h,
			x, y,
			x + w, y + h,
			x, y,
			x + w, y + h,
			x + w, y
		]
	}

	getModelViewMatrix(): mat4 {
		const mat = mat4.create();
		mat4.translate(mat, mat, [this.coord.x * 16, this.coord.y * 16, 0]);
		return mat;
	}

	rebuild(gl: WebGLRenderingContext, attribs: any): void {
		if (this._vertsBuffer === undefined) this._vertsBuffer = gl.createBuffer() as WebGLBuffer;
		if (this._textureVertsBuffer === undefined) this._textureVertsBuffer = gl.createBuffer() as WebGLBuffer;

		const verts = attribs["aVertexPosition"];
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertsBuffer as WebGLBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.getVerts(), gl.STATIC_DRAW);
		gl.vertexAttribPointer(verts.location, 2, gl.FLOAT, false, 0, 0);

		const texCoord = attribs["aTextureCoord"];
		gl.bindBuffer(gl.ARRAY_BUFFER, this._textureVertsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.getTextureVerts(), gl.STATIC_DRAW);
		gl.vertexAttribPointer(texCoord.location, 2, gl.FLOAT, false, 0, 0);

		this._needsRebuild = false;
	}

	render(info: RenderInfo) {
		const { gl, programInfo } = info;
		const { attribs, uniforms } = programInfo;

		if (this.needsRebuild()) this.rebuild(gl, programInfo.attribs);

		const verts = attribs["aVertexPosition"];
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertsBuffer as WebGLBuffer);
		gl.vertexAttribPointer(verts.location, 2, gl.FLOAT, false, 0, 0);

		const texCoord = attribs["aTextureCoord"];
		gl.bindBuffer(gl.ARRAY_BUFFER, this._textureVertsBuffer as WebGLBuffer);
		gl.vertexAttribPointer(texCoord.location, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(uniforms["uModelViewMatrix"], false, this.getModelViewMatrix());

		gl.drawArrays(gl.TRIANGLES, 0, LevelChunk.chunkVertSize / 2);
	}

	needsRebuild(): boolean {
		return this._needsRebuild || this._vertsBuffer === undefined || this._textureVertsBuffer === undefined;
	}
}

export class LevelObject extends RotMGObject<Ground> {
	_chunks: CoordinateMap<LevelChunk> = new CoordinateMap()

	onAddedToScene() {
		super.onAddedToScene();

		for (let x = -64; x < 64; x++) {
			for (let y = -64; y < 64; y++) {
				this.set(this.xmlData as Ground, {x, y})
			}
		}
	}

	render(info: RenderInfo) {
		const { gl, programInfo } = info;
		const { uniforms, program } = programInfo;
		const helper = this.getGame()?.renderHelper as RenderHelper;
		const texture = helper.getTexture(this.getSprite() as Sprite);

		gl.useProgram(program);
		gl.bindTexture(gl.TEXTURE_2D, texture.texture);

		gl.uniform2f(uniforms["uTextureRes"], 1024, 1024);
		gl.uniform4f(uniforms["uColor"], Color.White.r, Color.White.g, Color.White.b, Color.White.a);
		
		for (const chunk of this._chunks) {
			chunk[1].render(info);
		}
	}

	set(tile: Ground, coord: MapCoord) {
		const chunkPos = this.getChunkPos(coord);

		let chunk;
		if (!this._chunks.has(chunkPos)) {
			chunk = new LevelChunk(chunkPos);
			this._chunks.set(chunkPos, chunk);
		} else {
			chunk = this._chunks.get(chunkPos) as LevelChunk;
		}

		chunk.set(coord, tile, (this.getGame() as RotMGGame).renderHelper as RenderHelper);
	}

	getChunkPos(coord: MapCoord) {
		return { x: Math.floor(coord.x / 16), y: Math.floor(coord.y / 16) }
	}

	getProgramName() {
		return "textured"
	}
}