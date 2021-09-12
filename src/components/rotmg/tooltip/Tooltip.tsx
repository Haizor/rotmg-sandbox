import Activate from "common/asset/rotmg/data/activate/Activate";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import Decoy from "common/asset/rotmg/data/activate/Decoy";
import EffectBlast from "common/asset/rotmg/data/activate/EffectBlast";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import IncrementStat from "common/asset/rotmg/data/activate/IncrementStat";
import PoisonGrenade from "common/asset/rotmg/data/activate/PoisonGrenade";
import Trap from "common/asset/rotmg/data/activate/Trap";
import VampireBlast from "common/asset/rotmg/data/activate/VampireBlast";
import Equipment from "common/asset/rotmg/data/Equipment";
import Item from "common/asset/rotmg/data/Item";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import type PlayerManager from "common/PlayerManager";
import React, { CSSProperties } from "react";
import SpriteComponent from "../Sprite";
import styles from "./Tooltip.module.css"

type Props = {
	item: Item;
	x: number
	y: number
}
type ActivateRendererTextType = "normal" | "value" | "wis" | "linebreak"
type ActivateRendererText = { text?: string, type: ActivateRendererTextType, noMarginLeft?: boolean, noMarginRight?: boolean } | string
type ActivateRenderer<T> = (activate: T, manager: PlayerManager) => ActivateRendererText[]

export default class Tooltip extends React.Component<Props> {
	static manager: PlayerManager;
	static activateRenderers: Map<string, ActivateRenderer<any>> = new Map();

	tooltipDiv: React.RefObject<HTMLDivElement>
	constructor(props: Props) {
		super(props);
		this.tooltipDiv = React.createRef();
	}

	static setPlayerManager(manager: PlayerManager) {
		Tooltip.manager = manager;
	}


	getItemTierText(): string {
		const tier = this.getItemData().tier;
		return (typeof(tier) === "number" ? "T" : "") + tier;
	}

	getItemTierCSS(): CSSProperties {
		return {
			fontSize: "2vw",
			color: "white"
		}
	}

	hasProjectile(): boolean {
		return this.getItemData().hasProjectiles();
	}

	isSoulbound(): boolean {
		return this.getItemData().soulbound;
	}

	getItemData(): Equipment {
		return this.props.item.data;
	}

	getUsableClassText(): string {
		return "Wizard"
	}

	getDamageText(): string {
		const data = this.getItemData();
		return data.projectiles[0].minDamage + "-" + data.projectiles[0].maxDamage;
	}

	getDamageTextStyle(): CSSProperties {
		return {
			color: "#FFFF8F",

		}
	}
	
	getWis() {
		return Tooltip.manager?.getStats().wis ?? 0;
	}

	renderActivate(activate: Activate): React.ReactNode {
		const renderer = Tooltip.activateRenderers.get(activate.getName());
		if (renderer !== undefined) {
			return <div className={styles.propertyLine}>
				{renderer(activate, Tooltip.manager).map((text) => {
					if (typeof(text) === "string") {
						if (text !== "") return <div className={styles.propertyName}>{text}</div>
					} else {
						if (text.type === "linebreak") return <div className={styles.break}></div>
						const style: CSSProperties = {
							marginLeft: text.noMarginLeft ? "0px" : "",
							marginRight: text.noMarginRight ? "0px" : "",
						}
						let className = "";
						switch(text.type) {
							case "value":
								className += styles.propertyValue;
								break;
							case "wis":
								className += styles.propertyWis;
								break;
							default: 
								className += styles.propertyName;
								break;
						}
						return <div style={style} className={className}>{text.text}</div>
					}
					return null;
				})}
			</div>
		}
		return null;
	}

	renderProperty(name: string | undefined, value: any) {
		if (value === undefined) return;

		return <div className={styles.propertyLine}>
			{name !== undefined && name !== "" && 
				<div className={styles.propertyName}>
					{name}:
				</div>
			}

			<div className={styles.propertyValue}>
				{value}
			</div>
		</div>
	}

	renderStats() {
		const data = this.getItemData();
		if (data.stats.isZero()) return;
		return <div className={styles.statContainer}>
			<div className={styles.propertyName} style={{margin: "0px 0px"}}>
				On Equip:
			</div>
			{data.stats.hp !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.hp)} Max HP`}</div>}
			{data.stats.mp !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.mp)} Max MP`}</div>}
			{data.stats.atk !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.atk)} Attack`}</div>}
			{data.stats.def !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.def)} Defense`}</div>}
			{data.stats.spd !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.spd)} Speed`}</div>}
			{data.stats.dex !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.dex)} Dexterity`}</div>}
			{data.stats.vit !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.vit)} Vitality`}</div>}
			{data.stats.wis !== 0 && <div className={styles.stat}>{`${this.formatNumber(data.stats.wis)} Wisdom`}</div>}
		</div>
	}

	formatNumber(num: number) {
		return `${num > 0 ? "+" : ""}${num}`
	}

	render() {
		let { x, y } = this.props;



		const div = this.tooltipDiv.current;
		if (div !== null) {
			const rect = div.getBoundingClientRect();

			if (x + rect.width > window.innerWidth) {
				x -= rect.width;
			}
			if (y + rect.height > window.innerHeight) {
				y -= rect.height;
			}
			if (x < 0) {
				x = 0;
			}
			if (y < 0) {
				y = 0;
			}
		}
		return (
			<div ref={this.tooltipDiv} className={styles.tooltipBack} style={{left: x + "px", top: y + "px"}}>
				<div className={styles.tooltipTop}>
					<div className={styles.topItemInfo}>
						<div className={styles.itemIcon}>
							<SpriteComponent texture={this.props.item.data.texture} />
						</div>
						<div className={styles.itemTitle}>
							{this.props.item.data.getDisplayName()}
						</div>
						<div style={this.getItemTierCSS()}>
							{this.getItemTierText()}
						</div>
					</div>
					<div className={styles.usableClassText}>
						{this.getUsableClassText()}
					</div>
				</div>
				<div className={styles.tooltipMiddle}>
					{this.hasProjectile() && (
						<div>
							<div className={styles.smallDarkText}>
								Damage
							</div>
							<div className={styles.largeText} style={this.getDamageTextStyle()}>
								{this.getDamageText()}
							</div>
						</div>
					)}
					{this.isSoulbound() && (
						<div className={styles.soulboundText}>
							Soulbound
						</div>
					)}
					<div className={styles.descriptionText}>
						{this.getItemData().description}
					</div>
					<div className={styles.splitter} />
					<div>
						{this.getItemData().extraTooltipData.map((info, index) => <div key={index}>{this.renderProperty(info.name, info.description)}</div>)}
					</div>
					<div>
						{this.getItemData().activates.map((activate, index) => <div key={index}>{this.renderActivate(activate)}</div>)}
					</div>
					{this.getItemData().numProjectiles !== 1 && this.renderProperty("Shots", this.getItemData().numProjectiles)}
					{this.renderProperty("Range", this.getItemData().getRange())}
					{this.renderProperty("Rate of Fire", this.getItemData().getROF())}
					{this.getItemData().projectiles[0]?.boomerang && this.renderProperty(undefined, "Shots boomerang")}
					{this.getItemData().projectiles[0]?.multiHit && this.renderProperty(undefined, "Shots hit multple targets")}
					{this.getItemData().projectiles[0]?.passesCover && this.renderProperty(undefined, "Shots pass through obstacles")}
					{this.getItemData().projectiles[0]?.armorPiercing && this.renderProperty(undefined, "Ignores defense of target")}
					{this.renderStats()}
					{this.getItemData().mpCost !== 0 && this.renderProperty("MP Cost", this.getItemData().mpCost)}
					{this.getItemData().xpBonus && this.renderProperty("XP Bonus", this.getItemData().xpBonus + "%")}
				</div>
				<div className={styles.tooltipBottom}>
					{this.getItemData().feedPower && <div className={styles.feedPower}>Feed Power: {this.getItemData().feedPower}</div>}
				</div>
			</div>
		)
	}
}

Tooltip.activateRenderers.set("BulletNova", (activate: BulletNova) => [
	"Spell: ", { text: `${activate.numShots} Shots`, type: "value"}
])

Tooltip.activateRenderers.set("ConditionEffectSelf", (activate: ConditionEffectSelf, manager: PlayerManager) => {
	const wis = manager.getStats().wis;
	const bonusDuration = activate.getBonusDuration(wis);
	return [
		"Effect on Self:",
		{text: `${StatusEffectType[activate.effect]}`, type: "value"},
		"for",
		{text: `${activate.getDuration(manager.getStats().wis)}`, type: "value"},
		bonusDuration !== 0 ? {text: `(+${bonusDuration})`, type: "wis"} : "",
		"seconds"
	]
})

Tooltip.activateRenderers.set("ConditionEffectAura", (activate: ConditionEffectAura, manager: PlayerManager) => {
	const wis = manager.getStats().wis;
	const bonusDuration = activate.getBonusDuration(wis);
	const bonusRange = activate.getBonusRange(wis);
	return [
		"Party Effect: Within", 
		{text: `${activate.getRange(wis)}`, type: "value"},
		bonusRange !== 0 ? {text: `(+${bonusRange})`, type: "wis"} : "",
		"sqrs",
		{text: `${StatusEffectType[activate.effect]}`, type: "value"},
		"for",
		{text: `${activate.getDuration(manager.getStats().wis)}`, type: "value"},
		bonusDuration !== 0 ? {text: `(+${bonusDuration})`, type: "wis"} : "",
		"seconds"
	]
})

Tooltip.activateRenderers.set("Decoy", (activate: Decoy) => [
	"Decoy:",
	{text: `${activate.duration} seconds`, type: "value"},
	{type: "linebreak"},
	{text: `${activate.distance} squares`, type: "value"},
	"in",
	{text: "??? seconds", type: "value"}
])

Tooltip.activateRenderers.set("EffectBlast", (activate: EffectBlast, manager: PlayerManager) => {
	const wis = manager.getStats().wis;
	const bonusRadius = activate.getBonusRadius(wis);
	const bonusDuration = activate.getBonusDuration(wis);
	return [
		"Effect on Enemy:",
		{type: "linebreak"},
		{text: `${StatusEffectType[activate.condEffect]}`, type: "value"},
		"for",
		{text: `${activate.getDuration(wis)}`, type: "value"},
		bonusDuration !== 0 ? {text: `(+${bonusDuration})`, type: "wis"} : "",
		"seconds within",
		{text: `${activate.getRadius(wis)}`, type: "value"},
		bonusRadius !== 0 ? {text: `(+${bonusRadius})`, type: "wis"} : "",
		"squares"
	]
})

Tooltip.activateRenderers.set("HealNova", (activate: HealNova, manager: PlayerManager) => {
	const wis = manager.getStats().wis;
	const bonusAmount = activate.getBonusHealAmount(wis);
	const bonusRange = activate.getBonusRange(wis);
	return [
		"Party Heal:",
		{text: `${activate.getHealAmount(wis)}`, type: "value"},
		bonusAmount !== 0 ? {text: `(+${bonusAmount})`, type: "wis"} : "",
		"within",
		{text: `${activate.getRange(wis)}`, type: "value"},
		bonusRange !== 0 ? {text: `(+${bonusRange})`, type: "wis"} : "",
		"squares"
	]
})

Tooltip.activateRenderers.set("IncrementStat", (activate: IncrementStat) => activate.stats.map((name, value) => {
	if (value === 0) return ""
	
	return {text: `+${value} ${name}`, type: "value"}
}))

Tooltip.activateRenderers.set("PoisonGrenade", (activate: PoisonGrenade, manager: PlayerManager) => {
	return [
		"Poison:",
		{text: `${activate.totalDamage}`, type: "value"},
		{text: "damage (", type: "normal", noMarginRight: true},
		{text: `${activate.impactDamage}`, type: "value", noMarginLeft: true},
		"on impact) within",
		{text: `${activate.radius} squares`, type: "value"},
		{type: "linebreak"},
		{text: `${activate.throwTime} second`, type: "value"},
		"to throw and lasts",
		{text: `${activate.duration} seconds`, type: "value"}
	]
})

Tooltip.activateRenderers.set("Teleport", () => [
	{text: "Teleport to Target", type: "value"}
])

Tooltip.activateRenderers.set("Trap", (activate: Trap) => {
	const statusEffectText: ActivateRendererText[] = activate.condEffect !== StatusEffectType.Nothing ? [
		"Inflicts",
		{text: `${StatusEffectType[activate.condEffect]}`, type: "value"},
		"for",
		{text: `${activate.condDuration}`, type: "value"},
		"seconds",
		{type: "linebreak"}
	] : []

	return [
		"Trap:",
		{text: `${activate.totalDamage}`, type: "value"},
		"damage within",
		{text: `${activate.radius}`, type: "value"},
		"squares",
		{type: "linebreak"},
		...statusEffectText,
		{text: `${activate.throwTime} second`, type: "value"},
		"to arm for",
		{text: `${activate.duration} seconds`, type: "value"},
		{type: "linebreak"},
		"Triggers within",
		{text: `${activate.radius * activate.sensitivity}`, type: "value"},
		"squares"
	]
})

Tooltip.activateRenderers.set("VampireBlast", (activate: VampireBlast, manager: PlayerManager) => {
	const wis = manager.getStats().wis;
	const bonusDamage = activate.getBonusDamage(wis);
	const bonusHealRadius = activate.getBonusHealRadius(wis);
	return [
		"Skull:",
		{text: `${activate.getDamage(wis)}`, type: "value"},
		bonusDamage !== 0 ? {text: `(+${bonusDamage})`, type: "wis"} : "",
		"damage",
		{type: "linebreak"},
		"Within",
		{text: `${activate.radius}`, type: "value"},
		"squares",
		{type: "linebreak"},
		"Steals",
		{text: `${activate.heal}`, type: "value"},
		"HP and ignores",
		{text: `${activate.ignoreDef}`, type: "value"},
		"defense",
		{type: "linebreak"},
		"Heals allies within",
		{text: `${activate.getHealRadius(wis)}`, type: "value"},
		bonusHealRadius !== 0 ? {text: `(+${bonusHealRadius})`, type: "wis"} : "",
		"squares"
	]
})