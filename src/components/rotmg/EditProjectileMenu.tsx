import { assetManager } from "Assets";
import ProjectileRender from "common/asset/rotmg/data/ProjectileRender";
import { cloneDeep } from "lodash";
import React from "react";
import Form from "./Form";
import styles from "./EditProjectileMenu.module.css";
import CustomSpritesheet from "common/asset/rotmg/atlas/CustomSpritesheet";
import SpriteComponent from "./Sprite";

type Props = {
	proj: ProjectileRender;
	createFromExisting: boolean;
	bundleName?: string;
	onSave?: (proj: ProjectileRender) => void
	onUpdate?: (proj: ProjectileRender) => void
}

type State = {
	proj: ProjectileRender;
	bundleName: string;
}

export default class EditProjectileMenu extends Form<Props, State> {
	original?: ProjectileRender;

	constructor(props: Props) {
		super(props);
		this.state = this.updateFromProps();
	}

	canSave = () => {
		if (this.original && this.state.proj.id === this.original.id) {
			return {
				success: false,
				reason: "ID can't be the same as the source objects!"
			}
		}
		return {
			success: true,
		}
	}

	save = () => {
		if (this.props.createFromExisting && this.canSave().success) {
			this.props.onSave?.(this.state.proj);
		}
	}

	updateFromProps() {
		let proj = this.props.proj;

		if (this.props.createFromExisting) {
			this.original = proj;
			proj = cloneDeep(proj);
			proj.readOnly = false;
		}

		const result = assetManager.get<ProjectileRender>("rotmg", proj.id);

		return {proj, bundleName: this.props.bundleName ?? result?.bundle.name ?? ""};
	}

	update = () => {
		const bundle = assetManager.getBundle(this.state.bundleName);
		if (bundle && !bundle.default) {
			bundle.dirty = true;
		}
		this.props.onUpdate?.(this.state.proj)
		this.forceUpdate();
	}

	uploadSprite = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = false;
		input.click();

		input.onchange = async () => {
			if (input.files !== null && input.files[0] !== undefined) {
				const file = input.files[0];
				const img = new Image();
				img.src = URL.createObjectURL(file)
				img.addEventListener("load", () => URL.revokeObjectURL(img.src));

				const bundle = assetManager.getBundle(this.state.bundleName);
				if (bundle === undefined) return;
				const container = bundle.containers.get("sprites") as CustomSpritesheet ?? new CustomSpritesheet(this.state.bundleName);

				let sprite;

				const tex = this.state.proj.texture?.getTexture(0);
				if (tex !== undefined && container.name === tex?.file) {
					sprite = await container.set(tex.index, img);
				} else {
					sprite = await container.add(img);
				}
				
				if (sprite === undefined) return;

				container.setMetadata({loader: "custom-sprite-loader", type: "sprites"});
				bundle.containers.set("sprites", container);
				assetManager.addBundle(bundle);

				this.state.proj.texture = sprite.asTexture();

				this.update()
			}
			input.remove()
		}
	}

	render() {
		const canSave = this.canSave();

		return <div className={this.formStyle.container}>
			<div className={styles.editProjectileMenu}>
				<div className={this.formStyle.row}>
					<div className={styles.sprite} onClick={this.uploadSprite}>
						<SpriteComponent texture={this.state.proj.texture} />
					</div>

					{this.formatProp("ID", this.textProp(this.state.proj, "id"), styles.id)}
				</div>
				{this.formatProp("Angle Correction", this.boolProp(this.state.proj, "angleCorrection"), this.formStyle.span1)}
				{this.formatProp("Rotation", this.numProp(this.state.proj, "rotation"), this.formStyle.span1)}
			</div>
			<div className={styles.saveArea}>
				{!canSave.success && <div className={styles.error}>{canSave.reason}</div>}
				{this.props.createFromExisting && <React.Fragment>
					{/* {this.formatProp("Bundle Name", this.textProp(this.state, "bundleName"))} */}
					<button onClick={this.save} className={styles.save}>Save & Close</button>
				</React.Fragment>
				}
			</div>
		</div>
	}
}