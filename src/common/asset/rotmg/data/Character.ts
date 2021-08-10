import XMLObject from "./XMLObject";

export class Character extends XMLObject {
	maxHp: number = 100;
	defense: number = 0;
	

	group?: string;
	enemy: boolean = false;
	flying: boolean = false;
	quest: boolean = false;
	god: boolean = false;
	stasisImmune: boolean = false;
}