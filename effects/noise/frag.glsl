precision mediump float;
uniform sampler2D texture;
uniform vec3 noiseFactor;
uniform float time;
varying vec2 uv;

void main () {
  float random = fract(sin(dot(uv + time, vec2(12.9898,78.233)))*43758.5453123);
  vec3 color = vec3(texture2D(texture, uv));
  vec3 bounds = noiseFactor * color;
  vec3 noise = 2.0 * bounds * vec3(random) - bounds;
  gl_FragColor = vec4(color + noise, 1.0);
}