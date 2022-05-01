import { Effect } from "./effect.js";
import { Identity } from "./identity/identity.js";
import { Noise } from "./noise/noise.js";

// Chain of effects to be applied in order
class EffectsChain {

  static fx_reg = {};

  // initializes all effects and registers them for later use
  static init = async (regl) => {
    await Promise.all([
      Effect.init_effect(Identity, regl),
      Effect.init_effect(Noise, regl)
    ]);

    EffectsChain.fx_reg['identity'] = Identity;
    EffectsChain.fx_reg['noise'] = Noise;
  }

  constructor() {
    this.fx_chain = [];
  }

  // Adds a new instance of the chosen effect
  addEffect(effect_name) {
    if (!effect_name in EffectsChain.fx_reg) throw new Error(`Attempting to add unregistered effect ${effect_name}`);

    this.fx_chain.push(new EffectsChain.fx_reg[effect_name]);
  }

  // Applies all effects, in order, to the src_image
  apply(regl, src_image) {
    let texture = regl.texture({ data: src_image, flipY: true });
    this.fx_chain.forEach(fx => {
      texture = fx.apply(texture);
    });
  }
}

export { EffectsChain };