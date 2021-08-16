import { Sprite } from "common/asset/rotmg/atlas/NewSpritesheet";
import { CSSProperties } from "react";
import { assetManager } from "../../Assets";

import { TextureProvider } from "../../common/asset/rotmg/data/Texture";

type Props = {
	sprite?: Sprite;
	texture?: TextureProvider;
}

function SpriteComponent(props: Props) {
	let sprite = props.sprite;

	if (sprite === undefined && props.texture !== undefined) {
		sprite = assetManager.get<Sprite>("sprites", {texture: props.texture.getTexture(0)})?.value;
	}

	if (sprite === undefined) {
		return <div></div>;
	}

	const data = sprite.getData();

	const style: CSSProperties = {};

	const size = 64;
	const ratio = size / 8;

	style.width = 8 + "px";
	style.height = 8 + "px";
	style.backgroundImage = `url("${sprite.getAtlasSource()}")`;
	style.backgroundPosition = `-${data.position.x}px -${data.position.y}px`
	style.transform = `scale(${ratio * 100}%)`
	style.transformOrigin = "0% 0%";
	style.imageRendering = "crisp-edges";
	
	const outlineSize = 0.1;

	const outline = `
		drop-shadow(${outlineSize}px ${outlineSize}px 0.1px)
		drop-shadow(${-outlineSize}px ${outlineSize}px 0.1px)
		drop-shadow(${-outlineSize}px ${-outlineSize}px 0.1px)
		drop-shadow(${outlineSize}px ${-outlineSize}px 0.1px)
	`
	style.filter = outline;

	return (
		<div style={{width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center"}}>
			<div style={{width: "64px", height: "64px"}}>
				<div style={style}></div>
			</div>
		</div>
	)
}

export default SpriteComponent;