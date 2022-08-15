import { VertEffect } from "./effect";

export default class Tilt extends VertEffect {

  args: object;
  direction: number;

  constructor(id: number) {
    super(id);
    this.type = 'tilt';
    this.args = {
      freq: 0.5,
      amp: 0.5,
      qty: 0.6,
    };
    this.direction = 1.0;

    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.uniforms[`direction${this.id}`] = (_, props) => props[`direction${this.id}`];
    this.config.frag_partial = `
      vec2 pos = uv;
      float sliceSize = 1.0 / args${this.id}.z;
      float begin, end, dir;
      vec3 X = vec3(pos.x);
      vec3 Y = vec3(pos.y);

      float tmod = mod(floor(t), floor(args${this.id}.x * 10.0));

      for(float i = 0.0; i < 20.0; i++) {
        if (i >= args${this.id}.z) {
          break;
        }
        begin = i * sliceSize;
        end = (i + 1.0) * sliceSize;
        dir = mod(i, 2.0);
        if (dir == 0.0) {
          dir = -1.0;
        }
        if (direction${this.id} == 1.0) {
          if (pos.y >= begin && pos.y < end) {
            X.r = pos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
            X.g = pos.x - sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
            X.b = pos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y + args${this.id}.y;
          }
        } else {
          if (pos.x >= begin && pos.x < end) {
            Y.r = pos.y + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
            Y.g = pos.y - sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
            Y.b = pos.y + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y + args${this.id}.y;
          }
        }
      }

      vec2 redUV = vec2(X.r, Y.r);
      vec2 greenUV = vec2(X.g, Y.g);
      vec2 blueUV = vec2(X.b, Y.b);

      float r = texture2D(texture, redUV).r;
      float g = texture2D(texture, greenUV).g;
      float b = texture2D(texture, blueUV).b;
      
      color = vec3(r, g, b);
    `;
  }

  getParams(): object {
    let params = super.getParams();
    params[`args${this.id}`] = Object.values(this.args);
    params[`args${this.id}`][2] *= 10;
    params[`direction${this.id}`] = this.direction;
    return params;
  }
}