export type EventListener = (...params: any[]) => EventResult;

export enum EventResult {
	Fail,
	Pass,
	Success
}

export class EventEmitter {
	private _listeners: Map<string, EventListener[]> = new Map();

	on(name: string, listener: EventListener) {
		if (!this._listeners.has(name)) {
			this._listeners.set(name, []);
		}
		this._listeners.get(name)?.push(listener);
	}

	trigger(name: string, ...args: any[]) {
		if (this._listeners.has(name)) {
			const listeners = this._listeners.get(name) as EventListener[];
			for (const listener of listeners) {
				const result = listener(args);
				if (result !== undefined) {
					if (result === EventResult.Fail || result === EventResult.Success) {
						return;
					} 
				}
			}
		}
	}

	remove(name: string, listener: EventListener): boolean {
		if (!this._listeners.has(name)) return false;
		this._listeners.set(name, this._listeners.get(name)?.filter((l) => l === listener) as EventListener[]);
		return true;
	}
}
