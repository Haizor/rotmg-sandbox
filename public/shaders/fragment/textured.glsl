varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp vec4 uColor;
uniform bool hasOutline;

void main(void) {
	highp vec4 pixelColor = texture2D(uSampler, vTextureCoord) * uColor;

	if (pixelColor.a < 0.01) {
		discard;
	}
	gl_FragColor = pixelColor;
}