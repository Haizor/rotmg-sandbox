import AssetManager from "common/asset/normal/AssetManager";
import { Sprite } from "common/asset/rotmg/atlas/NewSpritesheet";
import React from "react";
import { CSSProperties } from "react";
import { TextureProvider } from "../../common/asset/rotmg/data/Texture";

type Props = {
	sprite?: Sprite;
	texture?: TextureProvider;
}

export default class SpriteComponent extends React.Component<Props, {}> {
	static assetManager?: AssetManager;

	static setAssetManager(manager: AssetManager) {
		SpriteComponent.assetManager = manager;
	}

	render() {
		const { assetManager } = SpriteComponent;
		let sprite = this.props.sprite;

		if (sprite === undefined && this.props.texture !== undefined && assetManager !== undefined) {
			sprite = assetManager.get<Sprite>("sprites", {texture: this.props.texture.getTexture(0)})?.value;
		}

		let style: CSSProperties = {};

		if (sprite !== undefined) {
			const data = sprite.getData();
	
			const size = 64;
			const ratio = size / 8;
		
			style.width = 8 + "px";
			style.height = 8 + "px";
			style.backgroundImage = `url("${sprite.getAtlasSource()}")`;
			style.backgroundPosition = `-${Math.floor(data.position.x)}px -${Math.floor(data.position.y)}px`
			style.transform = `scale(${ratio * 100}%)`
			style.transformOrigin = "0% 0%";
			
			const outlineSize = 0;
		
			const outline = `
				drop-shadow(${outlineSize}px ${outlineSize}px 0.01em black)
				drop-shadow(${-outlineSize}px ${outlineSize}px 0.01em black)
				drop-shadow(${-outlineSize}px ${-outlineSize}px 0.01em black)
				drop-shadow(${outlineSize}px ${-outlineSize}px 0.01em black)
			`
			style.filter = outline;
		} else {
			style = {
				backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIBAMAAAA2IaO4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAP8A3JSaE90AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAASSURBVBjTY2BgEBREJzBEGBgAFWgBEZPDxfIAAAAASUVORK5CYII=")`,
				backgroundSize: "100%",
				width: "64px",
				height: "64px",
			}
		}

		if (navigator.userAgent.indexOf("Firefox") !== -1) {
			style.imageRendering = "crisp-edges"
		} else {
			style.imageRendering = "pixelated"
		}
	
	
		return (
			<div style={{width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center"}}>
				<div style={{width: "64px", height: "64px"}}>
					<div style={style}></div>
				</div>
			</div>
		)
	}
}