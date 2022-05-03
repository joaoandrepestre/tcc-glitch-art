import { Effect } from "../effect.js";

// Filter effect, applies a rgb filter to the image
// parameters:
//  - threshold: from 0 to 1, indicates the cut-off point for the filter for each rgb component
//  - high_low: 1 or -1, indicates if the filter is low pass or high pass. Defaults to 1, high pass
class Filter extends Effect {
  static name = 'filter';
  static extra_config = {
    uniforms: {
      ...Effect.basicConfig.uniforms,
      threshold: (_, props) => props.threshold,
      high_low: (_, props) => props.high_low
    }
  };

  static define_fx_function = (effect) => (texture, threshold, high_low) => effect(texture, { threshold, high_low });

  constructor() {
    super();
    this.threshold = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };
    this.high_low = 1.0;
  }

  setParams(params) {
    if ('threshold' in params) this.threshold = params['threshold'];
    if ('high_low' in params) this.high_low = params['high_low'] === 'true' ? -1.0 : 1.0;
  }

  apply(texture) {
    let t = [this.threshold.red, this.threshold.green, this.threshold.blue];
    return Filter.fx_function(texture, t, this.high_low)
  }
}

export { Filter };