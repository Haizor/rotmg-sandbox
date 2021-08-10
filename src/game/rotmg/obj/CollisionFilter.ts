import GameObject from "game/engine/obj/GameObject";
import EnemyObject from "./EnemyObject";
import PlayerObject from "./PlayerObject";

export type CollisionFilter = (objA: GameObject, objB: GameObject) => boolean;

export const PlayerCollisionFilter = (objA: GameObject, objB: GameObject) => !(objB instanceof PlayerObject)
export const EnemyCollisionFilter = (objA: GameObject, objB: GameObject) => !(objB instanceof EnemyObject)