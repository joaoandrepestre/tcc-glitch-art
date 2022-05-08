import { Gui } from "../gui/gui.js";
import { Effect } from "./effect.js";

// Mapper effect, mixes color color space with the color space chosen by the user
// parameters:
//  - ratio: porportion of color values to mixed in with the chosen color space
//  - color_spaces: selected color space, as well as options to choose from 
class Mapper extends Effect {
  constructor(id) {
    super(id);
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

    this.config = {
      uniforms: {},
      frag_shader: {
        vars: `
        uniform vec3 colorRatio${this.id};
        uniform float colorSpace${this.id};
        `,
        main: `
        vec3 other${this.id} = color;
  
        // get Hue, Chroma and Value
        vec4 P${this.id} = (color.g < color.b) ? vec4(color.bg, -1.0, 2.0/3.0) : vec4(color.gb, 0.0, -1.0/3.0);
        vec4 Q${this.id} = (color.r < P${this.id}.x) ? vec4(P${this.id}.xyw, color.r) : vec4(color.r, P${this.id}.yzx);
        float C${this.id} = Q${this.id}.x - min(Q${this.id}.w, Q${this.id}.y);
        float H${this.id} = abs((Q${this.id}.w - Q${this.id}.y) / (6.0 * C${this.id} + 1e-10) + Q${this.id}.z);
        float V${this.id} = Q${this.id}.x;
  
        if (colorSpace${this.id} == 0.0) { // HSL
          // get Hue, Saturation, Lightness
          float L${this.id} = V${this.id} - C${this.id} * 0.5;
          float S${this.id} = C${this.id} / (1.0 - abs(L${this.id} * 2.0 - 1.0) + 1e-10);
          other${this.id} = vec3(H${this.id}, S${this.id}, L${this.id});
        } else if (colorSpace${this.id} == 1.0) { // HCV
          other${this.id} = vec3(H${this.id}, C${this.id}, V${this.id});
        } else if (colorSpace${this.id} == 2.0) { // HSV
          float S${this.id} = C${this.id} / (V${this.id} + 1e-10);
          other${this.id} = vec3(H${this.id}, S${this.id}, V${this.id});
        } 

        color = colorRatio${this.id} * other${this.id} + (vec3(1) - colorRatio${this.id}) * color;
        `
      }
    };
    this.config.uniforms[`colorRatio${this.id}`] = (_, props) => props[`colorRatio${this.id}`];
    this.config.uniforms[`colorSpace${this.id}`] = (_, props) => props[`colorSpace${this.id}`];
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
      Gui.updateEffectEditorLabels(this.id, 'ratio', newLabels);
    }
  }

  getParams() {
    let params = {};
    params[`colorRatio${this.id}`] = Object.values(this.ratio);
    params[`colorSpace${this.id}`] = this.color_spaces.selected;
    return params;
  }
}

export { Mapper };