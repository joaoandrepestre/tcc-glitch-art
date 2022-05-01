precision mediump float;
uniform sampler2D texture;
uniform vec3 threshold;
uniform float high_low;
varying vec2 uv;

void main () {
  vec3 color = vec3(texture2D(texture, uv));
  vec3 diff = high_low * (sign(color - threshold)) - 1.0;
  gl_FragColor = vec4(color + color * diff, 1.0);
}