import { AssetContainer, Metadata } from "../normal/AssetContainer";
import { deserializeObject } from "../normal/Serializable";
import Ground from "./data/Ground";

export default class RotMGGroundAssets implements AssetContainer<Ground> {
	private metadata: Metadata | undefined;
	private readOnly: boolean;
	private _groundTiles: Ground[] = [];

	constructor(readOnly: boolean = false) {
		this.readOnly = readOnly;
	}

	parseFromXML(xml: any): Ground | undefined {
		const ground = new Ground();
		deserializeObject(ground, xml);
		ground.readOnly = this.readOnly;
		this._groundTiles.push(ground);
		return;
	}

	get(id: any): Ground | undefined {
		return this._groundTiles.find((ground) => ground.id === id);
	}

	getAll(): Ground[] {
		return this._groundTiles;
	}

	getMetadata(): Metadata | undefined {
		return this.metadata;
	}

	setMetadata(metadata: Metadata): void {
		this.metadata = metadata;
	}
}