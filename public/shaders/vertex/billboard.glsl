attribute vec4 aVertexPosition;
attribute highp vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec3 uWorldPos;
uniform vec3 uOffset;

varying highp vec2 vTextureCoord;

void main(void) {
	mat4 viewMatrix = uViewMatrix;

	vec3 cameraRight = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);
	vec3 cameraUp = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);

	vec3 pos = uWorldPos + (cameraRight * aVertexPosition.x * 1.0) + (cameraUp * aVertexPosition.y * 1.0);

	gl_Position = (uProjectionMatrix * uViewMatrix * uModelViewMatrix * vec4(pos, 1.0)) + vec4(uOffset, 0.0);
	vTextureCoord = aTextureCoord;
}