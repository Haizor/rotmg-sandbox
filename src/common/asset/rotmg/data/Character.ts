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

	getSerializedObject() {
		return {
			...super.getSerializedObject(),
			MaxHitPoints: this.maxHp,
			Defense: this.defense,
			Group: this.group,
			Enemy: this.enemy,
			Flying: this.flying,
			Quest: this.quest,
			God: this.god
		}
	}
}