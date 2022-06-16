import DBHandler from "DBHandler";
import JSZip from "jszip"
import PopupManager from "PopupManager";
import React from "react";
import { AssetBundle, AssetContainer, AssetManager } from "@haizor/rotmg-utils";
import styles from "./AssetManagerViewer.module.css";

type EditorHandler = (bundle: AssetBundle, container: AssetContainer<unknown>) => React.ReactNode;

type Props = {
	assetManager: AssetManager;
	db: DBHandler;
	handlers?: Map<string, EditorHandler>
}

type State = {}

export default class AssetManagerViewer extends React.Component<Props, State> {
	downloadAssetBundle = (bundle: AssetBundle) => {
		const zip = bundle?.exportToZip();
		zip?.generateAsync({type: "blob"}).then((data) => {
			const url = window.URL.createObjectURL(data);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${bundle?.name}.zip`;
			document.body.appendChild(a);
			a.style.display = "none";
			a.click();
			setTimeout(() => {
				a.remove();
				window.URL.revokeObjectURL(url);
			}, 1000)
		})
	}

	uploadAssetBundle = () => {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.onchange = (ev) => {
			if (fileInput.files === null) return;
			const file = fileInput.files[0];
			file.arrayBuffer().then((buf) => {
				const zip = new JSZip();
				zip.loadAsync(buf).then(() => {
					this.props.assetManager.loadZip(zip);
				})
			})
		}
		fileInput.style.display = "none";
		document.body.appendChild(fileInput)
		fileInput.click();
	}

	deleteAssetBundle = (bundle: AssetBundle) => {
		this.props.assetManager.deleteAssetBundle(bundle);
		this.props.db.delete(bundle);
		this.forceUpdate();
	}

	assetBundle(bundle: AssetBundle) {
		const containers = Array.from(bundle.containers.entries()).map(([name, container]) => {
			const hasEditor = !bundle.default && this.props.handlers?.has(name);
			const onClick = () => {
				PopupManager.popup(bundle.name + "/" + name, this.props.handlers?.get(name)?.(bundle, container))
			}
			
			const nameDiv = hasEditor ? 
			<div key={name} className={styles.assetContainer} onClick={onClick}>
				<div className={styles.assetContainerName + " " + styles.editableContainer}>{name}</div>
			</div>
			:
			<div key={name} className={styles.assetContainer}>
				<div className={styles.assetContainerName}>{name}</div>
			</div>

			return (
				<div key={name} className={styles.assetContainer}>
					{nameDiv}
				</div>
			)
		})

		return (
			<div className={styles.assetBundle} key={bundle.name}>
				<div className={styles.assetBundleTitle}>
					{bundle.name}
					<div className={styles.assetBundleButtons}>
						<div className={`${styles.button} ${styles.downloadButton}`} onClick={() => this.downloadAssetBundle(bundle)}>
							
						</div>
						<div className={`${styles.button} ${styles.deleteButton}`} onClick={() => this.deleteAssetBundle(bundle)}>
							
						</div>
					</div>
				</div>
				{containers}
			</div>
		)
	}

	render() {
		const bundles = this.props.assetManager.getBundles();
		const nodes = bundles.map((bundle) => this.assetBundle(bundle))
		return (
			<div className={styles.assetManagerViewer}>
				{nodes}
				<button className={styles.uploadButton} onClick={this.uploadAssetBundle}>Upload</button>
			</div>
		)
	}
}