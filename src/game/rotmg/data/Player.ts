import XMLObject from './XMLObject'

export default class Player extends XMLObject {
	description: string = "This shouldn't show.";
	hitSound: string = "";
	deathSound: string = "";
}