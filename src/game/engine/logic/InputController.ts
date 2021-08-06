export class InputController {
	private _keysPressed: Map<string, boolean> = new Map();
	private _mouseButtonsPressed: Map<number, boolean> = new Map();
	constructor(target: HTMLElement) {
		target.tabIndex = 1000;

		target.addEventListener("keydown", (ev) => {
			this._keysPressed.set(ev.key, true);
		});
		target.addEventListener("keyup", (ev) => {
			this._keysPressed.set(ev.key, false);
		})
		target.addEventListener("mousedown", (ev) => {
			this._mouseButtonsPressed.set(ev.button, true);
		})
		target.addEventListener("mouseup", (ev) => {
			this._mouseButtonsPressed.set(ev.button, false);
		})
	}

	isKeyDown(key: string): boolean {
		return this._keysPressed.get(key) || false;
	}

	isMouseButtonDown(button: number): boolean {
		return this._mouseButtonsPressed.get(button) || false;
	}
}