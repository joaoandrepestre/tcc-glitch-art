import { Effect } from "./effect.js";
import { Identity } from "./identity/identity.js";
import { Noise } from "./noise/noise.js";

class EffectsChain {

  static fx_reg = {};

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

  addEffect(effect_name) {
    if (!effect_name in EffectsChain.fx_reg) throw new Error(`Attempting to add unregistered effect ${effect_name}`);

    this.fx_chain.push(new EffectsChain.fx_reg[effect_name]);
  }

  apply(src_image) {
    this.fx_chain.forEach(fx => {
      fx.apply(src_image);
    });
  }
}

export { EffectsChain };