import { VertEffect } from "./effect";

export default class Tilt extends VertEffect {

  args: object;

  constructor(id: number) {
    super(id);
    this.type = 'tilt';
    this.args = {
      freq: 0.5,
      amp: 0.5,
      qty: 0.6,
    };

    this.config.uniforms[`args${this.id}`] = (_, props) => props[`args${this.id}`];
    this.config.frag_partial = `
      vec2 pos = uv;
      float sliceSize = 1.0 / args${this.id}.z;
      float begin, end, dir;
      float redX, greenX, blueX;

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
        if (pos.y >= begin && pos.y < end) {
          redX = pos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          greenX = pos.x - sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          blueX = pos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y + args${this.id}.y;
        }
      }

      vec2 redUV = vec2(redX, pos.y);
      vec2 greenUV = vec2(greenX, pos.y);
      vec2 blueUV = vec2(blueX, pos.y);

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
    return params;
  }
}