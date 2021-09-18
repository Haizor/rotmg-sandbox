import { Data } from "common/asset/normal/Serializable";

export default class Transition {
	@Data("#text")
	id: string = "";

	@Data("@_afterTime")
	afterTime?: number;
	@Data("@_hitpointsLessThan")
	hitpointsLessThan?: number; 
	@Data("@_playerWithin")
	playerWithin?: number;
	@Data("@_noPlayerWithin")
	noPlayerWithin?: number;
	@Data("@_noneExist")
	noneExist?: string | number;
	@Data("@_exist")
	exist?: string | number;
	@Data("@_random")
	random?: number;
	@Data("@_playerSays")
	playerSays?: string;
	@Data("@_hasTag")
	hasTag?: string;
	@Data("@_noTag")
	noTag?: string;
	@Data("@_onTile")
	onTile?: string;
}