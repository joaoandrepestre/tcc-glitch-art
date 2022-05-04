import { Gui } from "../../gui/gui.js";
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
      hue: 0.5,
      sat: 0.5,
      light: 0.5
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
    if ('color_spaces' in params) {
      this.color_spaces.selected = this.color_spaces.options.findIndex(opt => opt === params['color_spaces']);
      let r = Object.values(this.ratio);
      this.ratio = { hue: r[0] };
      if (this.color_spaces.selected == 0) {
        this.ratio['sat'] = r[1];
        this.ratio['light'] = r[2];
      } else if (this.color_spaces.selected == 1) {
        this.ratio['chroma'] = r[1];
        this.ratio['value'] = r[2];
      } else if (this.color_spaces.selected == 2) {
        this.ratio['sat'] = r[1];
        this.ratio['value'] = r[2];
      }
      let newLabels = Object.keys(this.ratio).map(key => key.replace('_', ' ').toUpperCase());
      Gui.updateEffectEditorLabels('ratio', newLabels);
    }
  }

  apply(texture) {
    let r = Object.values(this.ratio);
    return Mapper.fx_function(texture, r, this.color_spaces.selected);
  }
}

export { Mapper };