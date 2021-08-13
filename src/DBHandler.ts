import AssetBundle from "common/asset/normal/AssetBundle";
import AssetManager from "common/asset/normal/AssetManager";
import JSZip from "jszip";

export default class DBHandler {
	db: IDBDatabase | undefined;
	assetManager: AssetManager;

	constructor(assetManager: AssetManager) {
		this.assetManager = assetManager;
	}

	load() {
		return new Promise((res, rej) => {
			const request = indexedDB.open("haizor/rotmg", 1);

			request.onsuccess = async (ev) => {
				this.db = (ev.target as any).result as IDBDatabase;
				await this.loadBundles();
				res(this.db);
			}

			request.onupgradeneeded = (ev) => {
				console.log("???")
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
				console.log(ev)
				rej();
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
}