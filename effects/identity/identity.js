import { Effect } from "../effect.js";

class Identity extends Effect {
  static name = 'identity';

  apply(src_image) {
    Identity.fx_function(src_image);
  }
}

export { Identity };