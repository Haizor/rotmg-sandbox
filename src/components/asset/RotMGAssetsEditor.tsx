import AssetBundle from "common/asset/normal/AssetBundle";
import XMLObject from "common/asset/rotmg/data/XMLObject";
import RotMGAssets from "common/asset/rotmg/RotMGAssets";
import React from "react";
import styles from "./RotMGAssetsEditor.module.css"

type Props = {
	bundle: AssetBundle;
	container: RotMGAssets
}

export default class RotMGAssetsEditor extends React.Component<Props> {
	renderXMLObject = (object: XMLObject): React.ReactNode => {
		const remove = () => {
			this.props.container.remove(object);
			this.props.bundle.dirty = true;
			this.forceUpdate();
		}

		return <div key={object.id} className={styles.object}>
			<span>{object.id}</span>
			<span className={styles.deleteButton} onClick={remove}></span>
		</div>
	}

	render() {
		return <div className={styles.container}>
			{this.props.container.getAll().map((obj) => this.renderXMLObject(obj))}
		</div>;
	}
}