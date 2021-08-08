import { CSSProperties } from "react";
import { assetManager } from "../../Assets";
import { Sprite } from "../../game/rotmg/asset/atlas/Spritesheet";
import { TextureProvider } from "../../game/rotmg/data/Texture";

type Props = {
	texture: TextureProvider | undefined;
}

function SpriteComponent(props: Props) {
	if (props.texture === undefined) {
		return <div></div>;
	}

	const sprite = assetManager.get<Sprite>("sprites", {texture: props.texture.getTexture(0)})?.value;

	if (sprite === undefined) {
		return <div></div>;
	}

	const style: CSSProperties = {};

	const size = 64;
	const ratio = size / 8;

	style.width = 8 + "px";
	style.height = 8 + "px";
	style.backgroundImage = `url("https://www.haizor.net/rotmg/assets/production/atlases/mapObjects.png")`;
	style.backgroundPosition = `-${sprite.position.x}px -${sprite.position.y}px`
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
		<div style={{width: "64px", height: "64px"}}>
			<div style={style}></div>
		</div>
	)
}

export default SpriteComponent;