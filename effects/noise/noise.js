import { Effect } from "../effect.js";

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