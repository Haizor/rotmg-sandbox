attribute vec4 aVertexPosition;
attribute highp vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelViewMatrix * aVertexPosition;
	vTextureCoord = aTextureCoord;
}