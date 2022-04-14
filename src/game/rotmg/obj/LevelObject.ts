import Rect from "game/engine/logic/Rect";
import Vec2 from "game/engine/logic/Vec2";
import RenderInfo from "game/engine/RenderInfo";
import { mat4 } from "gl-matrix";
import { AssetManager, Ground, XMLObject } from "rotmg-utils";
import RotMGGame from "../RotMGGame";
import RotMGObject from "./RotMGObject";


//BIG TODO: make wall tiles use levelobject aswell
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

export class MeshChunk {
	private readonly _defaultChunkSize: number = 12 * 256;
	private _verts: Float32Array = new Float32Array(this._defaultChunkSize);
	private _textureVerts: Float32Array = new Float32Array(this._defaultChunkSize);
	coord: MapCoord;

	constructor(coord: MapCoord) {
		this.coord = coord;
	}

	set(coord: MapCoord, tile: GroundTile) {
		// const localCoord = this.toLocalCoord(coord);
		// let i = (localCoord.y + (localCoord.x * 16)) * 12;
		// const verts = tile.getVerts(coord.x, coord.y);
		// const textureVerts = tile.getTextureVerts(helper);
		// for (let z = 0; z < 12; z++) {
		// 	this._verts[i] = verts[z];
		// 	this._textureVerts[i] = textureVerts[z];
		// 	i++;
		// }
	}

	remove(coord: MapCoord) {
		const localCoord = this.toLocalCoord(coord);
		let i = (localCoord.y + (localCoord.x * 16)) * 12;
		for (let z = 0; z < 12; z++) {
			delete this._verts[i + z];
			delete this._textureVerts[i + z];
		}
	}

	toLocalCoord(coord: MapCoord) {
		return {x: Math.abs(coord.x % 16), y: Math.abs(coord.y % 16)}
	}

	getVerts() {
		return this._verts;
	}

	getTextureVerts() {
		return this._textureVerts;
	}

	size() {
		return this._defaultChunkSize;
	}
}

export class LevelMesh {
	private _chunks: CoordinateMap<MeshChunk> = new CoordinateMap();

	fromMap(map: CoordinateMap<GroundTile>) {
		map.forEach(([coord, tile]) => {
			this.add(coord, tile);
		})
	}

	add(coord: MapCoord, tile: GroundTile) {
		const chunk = this.getChunkFromWorldCoord(coord);
		chunk.set(coord, tile);
	}

	getChunk(coord: MapCoord): MeshChunk | undefined {
		return this._chunks.get(coord);
	}

	getChunkFromWorldCoord(coord: MapCoord): MeshChunk {
		const chunkCoord = {x: Math.floor(coord.x / 16), y: Math.floor(coord.y / 16)};
		if (this._chunks.has(chunkCoord)) {
			return this._chunks.get(chunkCoord) as MeshChunk;
		}
		const chunk = new MeshChunk(chunkCoord);
		this._chunks.set(chunkCoord, chunk);
		return chunk;
	}

	getChunks(): Iterable<MeshChunk> {
		return this._chunks.values()
	}

	getVerts(): Float32Array[] {
		return [this._chunks.get({x: 0, y: 0})?.getVerts() ?? new Float32Array()];
	}

	getTextureVerts(): Float32Array[] {
		return [this._chunks.get({x: 0, y: 0})?.getTextureVerts() ?? new Float32Array()];
	}
}

export default class LevelObject extends RotMGObject {
	verts: Float32Array;
	texVerts: number[] = [];
	buffer?: WebGLBuffer;
	mesh: LevelMesh;
	groundTiles: CoordinateMap<GroundTile> = new CoordinateMap();

	constructor(position: Vec2, data: Ground) {
		super(data);
		this.position = position;
		this.z = 0;
		this.verts = new Float32Array(this.getVerts())
		this.mesh = new LevelMesh();

	}

	onAddedToScene() {
		super.onAddedToScene();
		const tiles = [];
		for (let x = -64; x < 64; x++) {
			for (let y = -64; y < 64; y++) {
				tiles.push({ground: new GroundTile(this.xmlData as Ground), coord: {x, y}});
			}
		}
		this.setGrounds(tiles);
	}

	getBuffer(gl: WebGLRenderingContext): WebGLBuffer {
		if (this.buffer === undefined) {
			const buffer = gl.createBuffer();
			if (buffer === null) {
				throw new Error("Failed to create buffer!");
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW)
			this.buffer = buffer;
		}
		return this.buffer;
	}

	renderChunk(info: RenderInfo, chunk: MeshChunk | undefined) {
		// if (this.scene === null || chunk === undefined) {
		// 	return;
		// }

		// const { gl, manager, program } = info;
		// const posBuffer = manager.bufferManager.getBuffer()
		// const texPosBuffer = manager.bufferManager.getBuffer();

		// const sprite = this.getSprite() as GLSprite;

		// gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, chunk.getVerts(), gl.STATIC_DRAW)
		// gl.vertexAttribPointer(
		// 	gl.getAttribLocation(program, "aVertexPosition"),
		// 	2,
		// 	gl.FLOAT,
		// 	false,
		// 	0,
		// 	0
		// )
		// gl.enableVertexAttribArray(gl.getAttribLocation(program, "aVertexPosition"))

		// gl.bindBuffer(gl.ARRAY_BUFFER, texPosBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, chunk.getTextureVerts(), gl.STATIC_DRAW);
		// gl.vertexAttribPointer(gl.getAttribLocation(program, "aTextureCoord"), 2, gl.FLOAT, false, 0, 0);
		// gl.enableVertexAttribArray(gl.getAttribLocation(program, "aTextureCoord"))

		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, sprite.texture.texture)
		// gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		// gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, this.getModelViewMatrix());

		// {
		// 	const offset = 0;
		// 	const vertexCount = chunk.size() / 2;
		// 	gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
		// }

		// manager.bufferManager.finish()
	}

	render(info: RenderInfo) {
		// for (const chunk of this.mesh.getChunks()) {
		// 	this.renderChunk(info, chunk);
		// 	this.renderChunk(info, chunk);
		// }

		// info.manager.bufferManager.finish()
	}

	// coordsFromSprite(sprite: GLSprite) {
	// 	function fix(nums: number[]) {
	// 		for (let i = 0; i < nums.length; i += 2) nums[i] /= sprite.texture.size.width;
	// 		for (let i = 1; i < nums.length; i += 2) nums[i] /= sprite.texture.size.height;
	// 		return nums;
	// 	}

	// 	if (this.texVerts.length > 0) {
	// 		return this.texVerts;
	// 	}

	// 	let nums: number[] = []
	// 	for (let i = 0; i < this.verts.length / 6; i++) {
	// 		nums = [...nums, ...sprite.rect.toTriangles()]
	// 	}

	// 	const res = fix(nums);
	// 	this.texVerts = res;
	// 	return res;
	// }

	getVerts() {
		let verts: number[] = [];

		for (let x = 0; x < 20; x++) {
			for (let y = 0; y < 20; y++) {
				verts = [...verts, ...Rect.Zero.expand(1.01, 1.01).translate(x, y).toTriangles()]
			}
		}


		return verts;
	}

	getModelViewMatrix() {
		return mat4.create()
	}

	setGround(ground: GroundTile, coord: MapCoord) {
		this.groundTiles.set(coord, ground);
		this.recalculateMesh();
	}

	setGrounds(data: {ground: GroundTile, coord: MapCoord}[]) {
		for (const entry of data) {
			this.groundTiles.set(entry.coord, entry.ground);
		}
		this.recalculateMesh();
	}

	recalculateMesh() {
		this.mesh.fromMap(this.groundTiles)
	}

	getProgram(manager: AssetManager) {
		return manager.get("programs", "textured")?.value as WebGLProgram;
	}
}

export class GroundTile {
	data: Ground;

	constructor(data: Ground) {
		this.data = data;
	}

	getVerts(x: number, y: number): number[] {
		return Rect.Zero.expand(1.01, 1.01).translate(x, y).toTriangles();
	}

	// getTextureVerts(helper: RenderHelper): number[] {
	// 	const sprite = helper.getSpriteFromObject(this.data);
	// 	if (sprite === undefined) return [];
	// 	return sprite.rect.toTriangles().map((i, index) => {
	// 		if (i % 2 === 0) {
	// 			return i / 1024;
	// 		} else {
	// 			return i / 1024;
	// 		}
	// 	});
	// }
}