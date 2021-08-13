import { Serialize, XMLBoolean, XMLNoDefault } from "common/asset/normal/Serializable";
import { TextureProvider, TextureSerializer } from "./Texture";
import XMLObject from "./XMLObject";

export default class Wall extends XMLObject {
	@Serialize("Top", TextureSerializer, true)
	top?: TextureProvider;
	@Serialize("ShadowSize", XMLNoDefault(1))
	shadowSize: number = 1;
	@Serialize("Static", XMLBoolean)
	static: boolean = false;
	@Serialize("FullOccupy", XMLBoolean)
	fullOccupy: boolean = false;
	@Serialize("OccupySquare", XMLBoolean)
	occupySquare: boolean = false;
	@Serialize("EnemyOccupySquare", XMLBoolean)
	enemyOccupySquare: boolean = false;
	@Serialize("BlocksSight", XMLBoolean)
	blocksSight: boolean = false;
}