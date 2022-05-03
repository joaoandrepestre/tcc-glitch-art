import { Effect } from "../effect.js";

// Noise effect, applies some white noise to the image
// parameters: 
//  - noiseFactor: factor from 0 to 1 of the intensity of the noise for each color component
class Noise extends Effect {
  static name = 'noise';
  static extra_config = {
    uniforms: {
      ...Effect.basicConfig.uniforms,
      noiseFactor: (_, props) => props.noiseFactor,
      time: ctx => ctx.time
    }
  };

  static define_fx_function = (effect) => (texture, noiseFactor) => effect(texture, { noiseFactor });

  constructor() {
    super();
    this.noise_factor = {
      red: 0.5,
      green: 0.5,
      blue: 0.5
    };
  }

  setParams(params) {
    if ('noise_factor' in params) this.noise_factor = params['noise_factor'];
  }

  apply(texture) {
    let factor = [this.noise_factor.red, this.noise_factor.green, this.noise_factor.blue];
    return Noise.fx_function(texture, factor);
  }
}

export { Noise };