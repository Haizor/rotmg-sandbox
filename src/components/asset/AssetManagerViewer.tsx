import AssetBundle from "common/asset/normal/AssetBundle";
import AssetManager from "common/asset/normal/AssetManager";
import JSZip from "jszip"
import React from "react";
import "./AssetManagerViewer.css"

type Props = {
	assetManager: AssetManager;
}

type State = {}

export default class AssetManagerViewer extends React.Component<Props, State> {
	downloadAssetBundle = (bundle: AssetBundle) => {
		const zip = bundle?.exportToZip();
		zip?.generateAsync({type: "uint8array"}).then((data) => {
			const blob = new Blob([data], {type: "zip"})
			const url = window.URL.createObjectURL(blob);
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

	assetBundle(bundle: AssetBundle) {
		const containers = Array.from(bundle.containers.entries()).map(([name, container]) => {
			return (
				<div className="assetContainer">
					<div className="assetContainerName">{name}</div>
				</div>
			)
		})

		return (
			<div className="assetBundle" key={bundle.name}>
				<div className="assetBundleTitle">
					{bundle.name}
					<div style={{paddingLeft: "8px", marginLeft: "auto"}} onClick={() => this.downloadAssetBundle(bundle)}>
						D
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
			<div className="assetManagerViewer">
				{nodes}
				<button onClick={this.uploadAssetBundle}>Upload</button>
			</div>
		)
	}
}