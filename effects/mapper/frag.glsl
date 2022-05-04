precision mediump float;
uniform sampler2D texture;
uniform vec3 colorRatio;
uniform float colorSpace;
varying vec2 uv;


// color space transformations got from:
// https://github.com/tobspr/GLSL-Color-Spaces/blob/master/ColorSpaces.inc.glsl

void main () {
  vec3 rgb = vec3(texture2D(texture, uv));
  vec3 other = rgb;
  
  // get Hue, Chroma and Value
  vec4 P = (rgb.g < rgb.b) ? vec4(rgb.bg, -1.0, 2.0/3.0) : vec4(rgb.gb, 0.0, -1.0/3.0);
  vec4 Q = (rgb.r < P.x) ? vec4(P.xyw, rgb.r) : vec4(rgb.r, P.yzx);
  float C = Q.x - min(Q.w, Q.y);
  float H = abs((Q.w - Q.y) / (6.0 * C + 1e-10) + Q.z);
  float V = Q.x;
  
  if (colorSpace == 0.0) { // HSL
    // get Hue, Saturation, Lightness
    float L = V - C * 0.5;
    float S = C / (1.0 - abs(L * 2.0 - 1.0) + 1e-10);
    other = vec3(H, S, L);
  } else if (colorSpace == 1.0) { // HCV
    other = vec3(H, C, V);
  } else if (colorSpace == 2.0) { // HSV
    float S = C / (V + 1e-10);
    other = vec3(H, S, V);
  } 

  vec3 color = colorRatio * other + (vec3(1) - colorRatio) * rgb;

  gl_FragColor = vec4(color, 1.0);
}