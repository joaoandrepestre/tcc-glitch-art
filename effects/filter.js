import { Effect } from "./effect.js";

// Filter effect, applies a rgb filter to the image
// parameters:
//  - threshold: from 0 to 1, indicates the cut-off point for the filter for each rgb component
//  - high_low: 1 or -1, indicates if the filter is low pass or high pass. Defaults to 1, high pass
class Filter extends Effect {
  constructor(id) {
    super(id);
    this.threshold = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };
    this.high_low = 1.0;

    this.config = {
      uniforms: {},
      frag_shader: {
        vars: `
        uniform vec3 threshold${this.id};
        uniform float high_low${this.id};
        `,
        main: `
        vec3 diff${this.id} = high_low${this.id} * (sign(color - threshold${this.id})) - 1.0;
        color += color * diff${this.id};
        `
      }
    };
    this.config.uniforms[`threshold${this.id}`] = (_, props) => props[`threshold${this.id}`];
    this.config.uniforms[`high_low${this.id}`] = (_, props) => props[`high_low${this.id}`];
  }

  setParams(params) {
    if ('threshold' in params) this.threshold = params['threshold'];
    if ('high_low' in params) this.high_low = params['high_low'] === 'true' ? -1.0 : 1.0;
  }

  getParams() {
    let params = {};
    params[`threshold${this.id}`] = Object.values(this.threshold);
    params[`high_low${this.id}`] = this.high_low;
    return params;
  }
}

export { Filter };