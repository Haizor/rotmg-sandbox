import EnemyObject from "../obj/EnemyObject";

export type BehaviorExecutionOptions = {
	enemy: EnemyObject,
	elapsed: number
}

export default class Behavior {
	bucket?: string

	execute(options: BehaviorExecutionOptions): boolean {
		return false;
	}

	setBucket(bucket: string): this {
		this.bucket = bucket;
		return this;
	}
}