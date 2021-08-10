import EnemyObject from "../obj/EnemyObject";

export default class Behavior {
	bucket?: string

	execute(enemy: EnemyObject): boolean {
		return false;
	}

	setBucket(bucket: string): this {
		this.bucket = bucket;
		return this;
	}
}