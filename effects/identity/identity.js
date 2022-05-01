import { Effect } from "../effect.js";

// Most basic effect, does not alter the image
class Identity extends Effect {
  static name = 'identity';

  apply(src_image) {
    Identity.fx_function(src_image);
  }
}

export { Identity };