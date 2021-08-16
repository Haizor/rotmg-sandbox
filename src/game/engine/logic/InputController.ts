import Vec2 from "./Vec2";

export class InputController {
	private _keysHeld: Map<string, boolean> = new Map();
	private _keysPressed: Map<string, boolean> = new Map();
	private _mouseButtonsPressed: Map<number, boolean> = new Map();
	private _target: HTMLElement;
	private _mousePos: Vec2 = new Vec2(0, 0);

	constructor(target: HTMLElement) {
		this._target = target;
		target.tabIndex = 1000;

		target.addEventListener("keydown", (ev) => {
			this._keysHeld.set(ev.key, true);
			this._keysPressed.set(ev.key, true);
		});
		target.addEventListener("keyup", (ev) => {
			this._keysHeld.set(ev.key, false);
		})
		target.addEventListener("mousedown", (ev) => {
			this._mouseButtonsPressed.set(ev.button, true);
		})
		target.addEventListener("mouseup", (ev) => {
			this._mouseButtonsPressed.set(ev.button, false);
		})
		target.addEventListener("mousemove", (ev) => {
			const rect = target.getBoundingClientRect();
			this._mousePos = new Vec2((ev.clientX - rect.left) / rect.width * 2 - 1, (ev.clientY - rect.top) / rect.height * -2 + 1);
		})
	}

	update() {
		this._keysPressed.clear();

	}

	isKeyDown(key: string): boolean {
		return this._keysHeld.get(key) || false;
	}

	isKeyPressed(key: string): boolean  {
		return this._keysPressed.get(key) || false;
	}

	isMouseButtonDown(button: number): boolean {
		return this._mouseButtonsPressed.get(button) || false;
	}

	getMousePos(): Vec2 {
		return this._mousePos;
	}
}