import { Effect } from "../effect.js";

// Mapper effect, mixes rgb color space with the color space chosen by the user
// parameters:
//  - ratio: porportion of rgb values to mixed in with the chosen color space
//  - color_spaces: selected color space, as well as options to choose from 
class Mapper extends Effect {
  static name = 'mapper';
  static extra_config = {
    uniforms: {
      ...Effect.basicConfig.uniforms,
      colorRatio: (_, props) => props.colorRatio,
      colorSpace: (_, props) => props.colorSpace
    }
  };

  static define_fx_function = (effect) => (texture, colorRatio, colorSpace) => effect(texture, { colorRatio, colorSpace });

  constructor() {
    super();
    this.ratio = {
      red: 0,
      green: 0,
      blue: 0
    };
    this.color_spaces = {
      selected: 0,
      options: [
        'HSL',
        'HCV',
        'HSV',
      ]
    };
  }

  setParams(params) {
    if ('ratio' in params) this.ratio = params['ratio'];
    if ('color_spaces' in params)
      this.color_spaces.selected = this.color_spaces.options.findIndex(opt => opt === params['color_spaces']);
  }

  apply(texture) {
    let r = [this.ratio.red, this.ratio.green, this.ratio.blue];
    return Mapper.fx_function(texture, r, this.color_spaces.selected);
  }
}

export { Mapper };