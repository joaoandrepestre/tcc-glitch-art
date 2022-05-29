import { FragEffect } from './effect';

// Filter effect, applies a rgb filter to the image
// parameters:
//  - threshold: from 0 to 1, indicates the cut-off point for the filter for each rgb component
//  - high_low: 1 or -1, indicates if the filter is low pass or high pass. Defaults to 1, high pass
export default class Filter extends FragEffect {

  threshold: object;
  high_low: number;

  constructor(id: number) {
    super(id);
    this.type = 'filter';
    this.threshold = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };
    this.high_low = 1.0;

    this.config.uniforms[`threshold${this.id}`] = (_, props) => props[`threshold${this.id}`];
    this.config.uniforms[`highLow${this.id}`] = (_, props) => props[`highLow${this.id}`];
    this.config.frag_partial = `
    vec3 diff${this.id} = highLow${this.id} * (sign(color - threshold${this.id})) - 1.0;
    color += color * diff${this.id};
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`threshold${this.id}`] = Object.values(this.threshold);
    params[`highLow${this.id}`] = this.high_low;
    return params;
  }
}