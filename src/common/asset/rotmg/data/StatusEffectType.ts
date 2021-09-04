enum StatusEffectType {
	Armored,
	Berserk,
	Damaging,
	Energized,
	Healing,
	Inspired,
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

export function StatusEffectTypeSerializer(input: StatusEffectType) {
	return StatusEffectType[input];
}

export default StatusEffectType