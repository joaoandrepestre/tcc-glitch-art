import { Effect } from "../effect.js";

// Most basic effect, does not alter the image
class Identity extends Effect {
  static name = 'identity';

  apply(texture) {
    return Identity.fx_function(texture);
  }
}

export { Identity };