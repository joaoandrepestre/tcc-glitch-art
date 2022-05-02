import { Effect } from "./effect.js";
import { Identity } from "./identity/identity.js";
import { Noise } from "./noise/noise.js";
import { Filter } from "./filter/filter.js";

// Chain of effects to be applied in order
class EffectsChain {

  static fx_reg = {};

  // initializes all effects and registers them for later use
  static init = async (regl) => {
    await Promise.all([
      Effect.init_effect(Identity, regl),
      Effect.init_effect(Noise, regl),
      Effect.init_effect(Filter, regl)
    ]);

    EffectsChain.fx_reg['identity'] = Identity;
    EffectsChain.fx_reg['noise'] = Noise;
    EffectsChain.fx_reg['filter'] = Filter;
  }

  constructor() {
    this.fx_chain = [];
    this.addEffect('identity');
  }

  // Adds a new instance of the chosen effect
  addEffect(effect_name) {
    if (!(effect_name in EffectsChain.fx_reg)) throw new Error(`Attempting to add unregistered effect ${effect_name}`);

    const id = this.fx_chain.length;
    const fx = new EffectsChain.fx_reg[effect_name](id);
    this.fx_chain.push(fx);
    return fx;
  }

  removeEffect(effect) {
    const index = this.fx_chain.findIndex(fx => fx === effect);
    this.fx_chain.splice(index, 1);
  }

  // Applies all effects, in order, to the src_image
  apply(texture) {
    let t = texture;
    this.fx_chain.forEach(fx => {
      t = fx.apply(t);
    });
    return t;
  }
}

export { EffectsChain };