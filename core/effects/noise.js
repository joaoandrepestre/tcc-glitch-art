import { FragEffect } from "./effect.js";

// Noise effect, applies some white noise to the image
// parameters: 
//  - noiseFactor: factor from 0 to 1 of the intensity of the noise for each color component
class Noise extends FragEffect {
  constructor(id) {
    super(id);
    this.noise_factor = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };

    this.config.uniforms[`noiseFactor${this.id}`] = (_, props) => props[`noiseFactor${this.id}`];
    this.config.frag_partial = `
    float random${this.id} = fract(sin(dot(uv + time, vec2(12.9898,78.233)))*43758.5453123);
    vec3 bounds${this.id} = noiseFactor${this.id} * color;
    vec3 noise${this.id} = 2.0 * bounds${this.id} * vec3(random${this.id}) - bounds${this.id};
    color += noise${this.id};
    `;
  }

  getParams() {
    let params = super.getParams();
    params[`noiseFactor${this.id}`] = Object.values(this.noise_factor);
    return params;
  }
}

export { Noise };