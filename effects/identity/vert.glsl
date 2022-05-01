precision mediump float;
attribute vec2 position;
uniform vec2 aspectRatio;
varying vec2 uv;
void main () {
  uv = 0.5 + 0.5 * vec2(position) * aspectRatio;
  gl_Position = vec4(position, 0, 1.0);
}