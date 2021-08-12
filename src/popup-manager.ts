import { EventEmitter } from "common/EventEmitter";
import React from "react";

class PopupManager extends EventEmitter {
	popups: Map<string, React.ReactNode> = new Map();

	popup(name: string, content: React.ReactNode) {
		this.popups.set(name, content);
		this.trigger("update");
	}
}

export default new PopupManager();