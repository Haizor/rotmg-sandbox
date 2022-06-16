import JSZip from "jszip";
import { AssetManager, AssetBundle } from "@haizor/rotmg-utils";

export default class DBHandler {
	db: IDBDatabase | undefined;
	assetManager: AssetManager;
	updateCache: {
		[key: string]: number
	} = {}

	constructor(assetManager: AssetManager) {
		this.assetManager = assetManager;
	}

	update() {
		const req = this.db?.transaction("assets", "readonly").objectStore("assets").getAll();

		if (req === undefined) return;
		req.onsuccess = async (ev) => {
			const bundles = req.result;
			for (const bundle of bundles) {
				if (bundle.time && bundle.time > (this.updateCache[bundle.name] ?? 0)) {
					this.loadBundle(bundle);
					this.updateCache[bundle.name] = bundle.time;
				}
			}
		}

		for (const bundle of this.assetManager.getBundles()) {
			if (bundle.dirty && !bundle.default) {
				this.set(bundle).then(() => bundle.dirty = false);
			}
		}
	}

	load() {
		return new Promise((res, rej) => {
			const request = indexedDB.open("haizor/rotmg", 3);

			request.onsuccess = async (ev) => {
				this.db = (ev.target as any).result as IDBDatabase;
				await this.loadBundles();
				setInterval(() => (this.update()), 1000)
				res(this.db);
			}

			request.onupgradeneeded = (ev) => {
				const db = (ev.target as any).result as IDBDatabase;
				try {
					db.deleteObjectStore("assets");
				} catch {}
				const store = db.createObjectStore("assets", { keyPath: "name" });
				
				store.createIndex("name", "name", { unique: true });
			}

			request.onblocked = (ev) => {
				console.log(ev);
			}

			request.onerror = (ev) => {
				console.log((ev.target as any).error)
				rej((ev.target as any).error);
			}
		});
	}

	private loadBundles() {
		return new Promise<void>((res, rej) => {
			const req = this.db?.transaction("assets", "readonly").objectStore("assets").getAll();
			if (req === undefined) return;
			req.onsuccess = async (ev) => {
				const bundles = req.result;
				await Promise.all(bundles.map((b) => this.loadBundle(b)));
				res();
			}
			req.onerror = rej;
		})
	}

	private async loadBundle(bundle: any) {
		const zip = await JSZip.loadAsync(bundle.data);
		await this.assetManager.loadZip(zip);
	}

	set(bundle: AssetBundle) {
		console.log(bundle.containers)
		return new Promise(async (res, rej) => {
			if (this.db === undefined) {rej(); return;}
			const bundleData = await bundle.exportToZip().generateAsync({type: "binarystring"})
			const req = this.db.transaction("assets", "readwrite").objectStore("assets").put({name: bundle.name, data: bundleData, time: Date.now() });
			req.onsuccess = res
			req.onerror = rej
		})
	}

	delete(bundle: AssetBundle) {
		return new Promise(async (res, rej) => {
			if (this.db === undefined) {rej(); return;}
			const req = this.db.transaction("assets", "readwrite").objectStore("assets").delete(bundle.name);
			req.onsuccess = res
			req.onerror = rej
		})
	}
}