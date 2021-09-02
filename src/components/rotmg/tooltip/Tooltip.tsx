import Equipment from "common/asset/rotmg/data/Equipment";
import Item from "common/asset/rotmg/data/Item";
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
	tooltipDiv: React.RefObject<HTMLDivElement>
	constructor(props: Props) {
		super(props);
		this.state = {x: props.x ?? 0, y: props.y ?? 0};
		this.tooltipDiv = React.createRef();
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

	renderProperty(name: string | undefined, value: any) {
		if (value === undefined) return;

		return <div className={styles.propertyLine}>
			{name !== undefined && 
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
			<div className={styles.propertyName} style={{margin: "-8px 0px"}}>
				On Equip:
			</div>
			{data.stats.hp !== 0 && <div className={styles.stat}>{`+${data.stats.hp} Max HP`}</div>}
			{data.stats.mp !== 0 && <div className={styles.stat}>{`+${data.stats.mp} Max MP`}</div>}
			{data.stats.atk !== 0 && <div className={styles.stat}>{`+${data.stats.atk} Attack`}</div>}
			{data.stats.def !== 0 && <div className={styles.stat}>{`+${data.stats.def} Defense`}</div>}
			{data.stats.spd !== 0 && <div className={styles.stat}>{`+${data.stats.spd} Speed`}</div>}
			{data.stats.dex !== 0 && <div className={styles.stat}>{`+${data.stats.dex} Dexterity`}</div>}
			{data.stats.vit !== 0 && <div className={styles.stat}>{`+${data.stats.vit} Vitality`}</div>}
			{data.stats.wis !== 0 && <div className={styles.stat}>{`+${data.stats.wis} Wisdom`}</div>}
		</div>
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