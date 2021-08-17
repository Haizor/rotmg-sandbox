import AssetBundle from "common/asset/normal/AssetBundle";
import AssetManager from "common/asset/normal/AssetManager";
import JSZip from "jszip";

export default class DBHandler {
	db: IDBDatabase | undefined;
	assetManager: AssetManager;

	constructor(assetManager: AssetManager) {
		this.assetManager = assetManager;
	}

	saveDirty() {
		for (const bundle of this.assetManager.getBundles()) {
			if (bundle.dirty) {
				for (const container of bundle.containers.values()) {
					console.log(container.getAll())
				}
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
				setInterval(() => (this.saveDirty()), 1000)
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
				const zips = await Promise.all(bundles.map((bundle) => JSZip.loadAsync(bundle.data)));
				await Promise.all(zips.map((zip) => this.assetManager.loadZip(zip)));
				res();
			}
			req.onerror = rej;
		})
	}

	set(bundle: AssetBundle) {
		return new Promise(async (res, rej) => {
			if (this.db === undefined) {rej(); return;}
			const bundleData = await bundle.exportToZip().generateAsync({type: "binarystring"})
			const req = this.db.transaction("assets", "readwrite").objectStore("assets").put({name: bundle.name, data: bundleData});
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