import GameObject from "game/engine/obj/GameObject";

export type CollisionFilter = (objA: GameObject, objB: GameObject) => boolean;

export const PlayerCollisionFilter = (objA: GameObject, objB: GameObject) => !(objB.hasTag("player"))
export const EnemyCollisionFilter = (objA: GameObject, objB: GameObject) => !(objB.hasTag("enemy"))