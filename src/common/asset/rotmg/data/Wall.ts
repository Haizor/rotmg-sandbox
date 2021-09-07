import { Data, XMLBoolean, XMLNoDefault } from "common/asset/normal/Serializable";
import { TextureProvider, TextureData } from "./Texture";
import XMLObject from "./XMLObject";

export default class Wall extends XMLObject {
	@Data("Top", TextureData)
	top?: TextureProvider;
	@Data("ShadowSize", XMLNoDefault(1))
	shadowSize: number = 1;
	@Data("Static", XMLBoolean)
	static: boolean = false;
	@Data("FullOccupy", XMLBoolean)
	fullOccupy: boolean = false;
	@Data("OccupySquare", XMLBoolean)
	occupySquare: boolean = false;
	@Data("EnemyOccupySquare", XMLBoolean)
	enemyOccupySquare: boolean = false;
	@Data("BlocksSight", XMLBoolean)
	blocksSight: boolean = false;
}