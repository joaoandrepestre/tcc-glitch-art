import { VertEffect } from "./effect.js";

// Wobble effect, ondulates the image around an axis
class Wobble extends VertEffect {
  constructor(id) {
    super(id);
    this.args = {
      freq: 0.5,
      amp: 0.5
    };

    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.vert_partial = `
    pos.x += sin(0.5 * 3.1415926538 * args${this.id}.x * time * pos.y + pos.x) * args${this.id}.y;
    `;
  }

  getParams() {
    let params = super.getParams();
    params[`args${this.id}`] = Object.values(this.args);
    return params;
  }
}

export { Wobble };