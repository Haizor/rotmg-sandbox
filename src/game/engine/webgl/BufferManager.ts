export default class BufferManager {
	private gl: WebGLRenderingContext;
	private _buffers: WebGLBuffer[];
	private _index = 0;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this._buffers = [];
	}

	getBuffer(): WebGLBuffer {
		if (this._buffers[this._index] === undefined) {
			const buffer = this.gl.createBuffer();
			if (buffer === null) {
				throw new Error("Buffer manager failed to create buffer!")
			}
			this._buffers[this._index] = buffer;
		}

		return this._buffers[this._index++];
	}

	finish() {
		this._index = 0;
	}
}