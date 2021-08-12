import { EventEmitter } from "common/EventEmitter";
import React from "react";

export class PopupManager extends EventEmitter {
	popups: Map<string, React.ReactNode> = new Map();

	close(name: string) {
		this.popups.delete(name);
		this.trigger("update", [...this.popups.entries()]);
	}

	popup(name: string, content: React.ReactNode) {
		this.popups.set(name, content);
		this.trigger("update", [...this.popups.entries()]);
	}
}


export default new PopupManager();