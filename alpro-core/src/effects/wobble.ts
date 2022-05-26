import { VertEffect } from "./effect";

// Wobble effect, ondulates the image around an axis
export default class Wobble extends VertEffect {

  args: object;

  constructor(id: number) {
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

  getParams(): object {
    let params = super.getParams();
    params[`args${this.id}`] = Object.values(this.args);
    return params;
  }
}