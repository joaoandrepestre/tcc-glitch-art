import { Effect } from "./effect.js";

// Wobble effect, ondulates the image around an axis
class Wobble extends Effect {
  constructor(id) {
    super(id);
    this.arguments = {
      freq: 0.5,
      amp: 0.5
    };

    this.config = {
      uniforms: {},
      vert_shader: {
        vars: `
        uniform vec2 args${this.id};
        uniform float time${this.id};
        `,
        main: `
        pos.x += sin(0.5 * 3.1415926538 * args${this.id}.x * time${this.id} * pos.y + pos.x) * args${this.id}.y;
        `
      }
    };
    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.uniforms[`time${this.id}`] = ctx => ctx.time;
  }

  setParams(params) {
    if ('arguments' in params) this.arguments = params['arguments'];
  }

  getParams() {
    let params = {};
    params[`args${this.id}`] = Object.values(this.arguments);
    return params;
  }
}

export { Wobble };