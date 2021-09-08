enum StatusEffectType {
	Nothing,

	Armored,
	Berserk,
	Damaging,
	Energized,
	Healing,
	Inspired,
	Invisible,
	Invulnerable,
	Speedy,

	"Armor Broken",
	Bleeding,
	Blind,
	Confused,
	Curse,
	Darkness,
	Dazed,
	Drunk,
	Exposed,

	Hallucinating,
	Hexed,
	Paralyzed,
	"Pet Stasis",
	Petrify,
	Quiet,
	Sick,
	Silenced,
	Slowed,
	Stasis,
	Stunned,
	Unstable,
	Weak,
}

export const StatusEffectTypeData = {
	serialize: (input: StatusEffectType) => StatusEffectType[input],
	deserialize: (input: any) => {
		if (input === undefined) return undefined;
		return StatusEffectType[input as keyof typeof StatusEffectType]
	}
}

export default StatusEffectType