import { FragEffect } from "./effect";

// Noise effect, applies some white noise to the image
// parameters: 
//  - noiseFactor: factor from 0 to 1 of the intensity of the noise for each color component
export default class Noise extends FragEffect {

  noise_factor: object;

  constructor(id: number) {
    super(id);
    this.type = 'noise';
    this.noise_factor = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };

    this.config.uniforms[`noiseFactor${this.id}`] = (_, props) => props[`noiseFactor${this.id}`];
    this.config.frag_partial = `
    vec3 bounds${this.id} = noiseFactor${this.id} * color;
    vec3 noise${this.id} = 2.0 * bounds${this.id} * vec3(random) - bounds${this.id};
    color += noise${this.id};
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`noiseFactor${this.id}`] = Object.values(this.noise_factor);
    return params;
  }
}