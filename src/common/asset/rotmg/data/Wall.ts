import { TextureProvider } from "./Texture";
import XMLObject from "./XMLObject";

export default class Wall extends XMLObject {
	top?: TextureProvider;
	shadowSize: number = 0;
	static: boolean = true;
	fullOccupy: boolean = true;
	occupySquare: boolean = true;
	enemyOccupySquare: boolean = true;
	blocksSight: boolean = true;
}