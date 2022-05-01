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

  static define_fx_function = (effect) => (image, noiseFactor) => effect(image, { noiseFactor });

  constructor() {
    super();
    this.noiseFactor = [0.5, 0.5, 0.5];
  }

  setNoiseFactor(redFactor, greenFactor, blueFactor) {
    this.noiseFactor = [redFactor, greenFactor, blueFactor];
  }

  apply(src_image) {
    Noise.fx_function(src_image, this.noiseFactor);
  }
}

export { Noise };