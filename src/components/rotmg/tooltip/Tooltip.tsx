import Activate from "common/asset/rotmg/data/activate/Activate";
import BulletNova from "common/asset/rotmg/data/activate/BulletNova";
import ConditionEffectAura from "common/asset/rotmg/data/activate/ConditionEffectAura";
import ConditionEffectSelf from "common/asset/rotmg/data/activate/ConditionEffectSelf";
import HealNova from "common/asset/rotmg/data/activate/HealNova";
import Equipment from "common/asset/rotmg/data/Equipment";
import Item from "common/asset/rotmg/data/Item";
import StatusEffectType from "common/asset/rotmg/data/StatusEffectType";
import type PlayerManager from "common/PlayerManager";
import React, { CSSProperties } from "react";
import SpriteComponent from "../Sprite";
import styles from "./Tooltip.module.css"

type Props = {
	item: Item;
	x?: number
	y?: number
}

type State = {
	x: number;
	y: number;
}

export default class Tooltip extends React.Component<Props, State> {
	static manager: PlayerManager;
	tooltipDiv: React.RefObject<HTMLDivElement>
	constructor(props: Props) {
		super(props);
		this.state = {x: props.x ?? 0, y: props.y ?? 0};
		this.tooltipDiv = React.createRef();
	}

	static setPlayerManager(manager: PlayerManager) {
		Tooltip.manager = manager;
	}

	componentDidMount() {
		window.addEventListener("mousemove", this.onMouseMove)
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.onMouseMove)
	}

	onMouseMove = (ev: MouseEvent) => {
		this.setState({x: ev.pageX, y: ev.pageY})
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

	//really unhappy with having to use &nbsp; but whatever i guess
	renderActivate(activate: Activate) {
		const wis = this.getWis();
		if (activate instanceof BulletNova) {
			return this.renderProperty("Spell", `${activate.numShots} Shots`)
		} else if (activate instanceof ConditionEffectAura) {
			return <div className={styles.propertyLine + " " + styles.propertyName}>
				Party Effect: Within 
				<span className={styles.propertyValue}>
					&nbsp;{activate.getRange(wis)}&nbsp;
				</span>
				sqrs
				<span className={styles.propertyValue}>
					&nbsp;{StatusEffectType[activate.effect]}&nbsp;
				</span>
				for
				<span className={styles.propertyValue}>
					&nbsp;{activate.getDuration(wis)}&nbsp;
				</span>
				seconds
			</div>
		} else if (activate instanceof ConditionEffectSelf) {
			return <div className={styles.propertyName}>
				Effect on Self:<br/>
				<span className={styles.propertyValue}>
					&nbsp;{StatusEffectType[activate.effect]}&nbsp;
				</span>
				for
				<span className={styles.propertyValue}>
					&nbsp;{activate.getDuration(wis)}&nbsp;
				</span>
				seconds
			</div>
		} else if (activate instanceof HealNova) {
			return <div className={styles.propertyName}>
				Party Heal:
				<span className={styles.propertyValue}>
					&nbsp;{activate.getHealAmount(wis)} HP&nbsp;
				</span>
				within
				<span className={styles.propertyValue}>
					&nbsp;{activate.getRange(wis)}&nbsp;
				</span>
				squares
			</div>
		}
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
		let { x, y } = this.state;

		const div = this.tooltipDiv.current;
		if (div !== null) {
			const rect = div.getBoundingClientRect();

			if (x + rect.width > window.innerWidth) {
				x -= rect.width;
			}
			if (y + rect.height > window.innerHeight) {
				y -= rect.height;
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
						{this.getItemData().extraTooltipData.map((info) => this.renderProperty(info.name, info.description))}
					</div>
					<div>
						{this.getItemData().activates.map((activate) => this.renderActivate(activate))}
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