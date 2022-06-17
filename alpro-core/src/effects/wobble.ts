import { FragEffect } from "./effect";

// Wobble effect, ondulates the image around an axis
export default class Wobble extends FragEffect {

  args: object;

  constructor(id: number) {
    super(id);
    this.type = 'wobble';
    this.args = {
      freq: 0.5,
      amp: 0.5
    };

    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.frag_partial = `
    vec2 pos = uv;
    pos.x += sin(2.0 * 3.1415926538 * args${this.id}.x * pos.y + time) * args${this.id}.y;
    color = vec3(texture2D(texture, pos));
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`args${this.id}`] = Object.values(this.args);
    return params;
  }
}