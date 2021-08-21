import { SlotType } from './Equipment';
import { Stats } from './Stats';
import XMLObject from './XMLObject'

export default class Player extends XMLObject {
	description: string = "This shouldn't show.";
	hitSound: string = "";
	deathSound: string = "";
	slotTypes: SlotType[] = [];
	equipment: number[] = [];
	stats: Stats = new Stats();
	maxStats: Stats = new Stats();
	bloodProb: number = 1;
}