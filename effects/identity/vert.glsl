precision mediump float;
attribute vec2 position;
varying vec2 uv;
void main () {
  uv = 0.5 + 0.5 * position;
  gl_Position = vec4(position, 0, 1.0);
}