precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform vec2 uTextureRes;
uniform bool uGrayscale;

void main(void) {
	vec4 pixelColor = texture2D(uSampler, vTextureCoord / uTextureRes) * uColor;
	if (uGrayscale) {
		float color = (pixelColor.r + pixelColor.g + pixelColor.b) / 3.0;
		pixelColor = vec4(color, color, color, pixelColor.a);
	}

	if (pixelColor.a < 0.01) {
		discard;
	}
	gl_FragColor = pixelColor;
}