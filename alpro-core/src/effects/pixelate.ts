import { VertEffect } from "./effect";

export default class Pixelate extends VertEffect {

  ratio: object;

  constructor(id: number) {
    super(id);
    this.type = 'pixelate';
    this.ratio = {
      width: 0.5,
      height: 0.5,
    };

    this.config.uniforms[`ratio${this.id}`] = (_, props) => props[`ratio${this.id}`];
    this.config.frag_partial = `
    vec2 pos;
    float w = dimensions.x * ratio${this.id}.x;
    float h = dimensions.y * ratio${this.id}.y;

    float dx = (1.0 / w);
    float dy = (1.0 / h);
    pos = vec2(dx * floor(uv.x / dx), dy * floor(uv.y / dy));
    color = vec3(texture2D(texture, pos));
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`ratio${this.id}`] = Object.values(this.ratio).map(x => x === 1.0 ? x : x / 10);
    return params;
  }
}