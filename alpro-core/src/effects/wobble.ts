import { VertEffect } from "./effect";

// Wobble effect, ondulates the image around an axis
export default class Wobble extends VertEffect {

  args: object;

  constructor(id: number) {
    super(id);
    this.type = 'wobble';
    this.args = {
      freq: 0.5,
      timeFreq: 0.5,
      amp: 0.5
    };

    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.frag_partial = `
    vec2 pos = uv;
    pos.x += sin(2.0 * pi * args${this.id}.x * pos.y + time * args${this.id}.y) * args${this.id}.z;
    color = vec3(texture2D(texture, pos));
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`args${this.id}`] = Object.values(this.args);
    return params;
  }
}