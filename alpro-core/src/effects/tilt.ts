import { PositionEffect } from "./effect";

export default class Tilt extends PositionEffect {

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
    this.config.pos_transform = `
      float sliceSize = 1.0 / args${this.id}.z;
      float begin, end, dir;
      vec3 X = vec3(redPos.x, greenPos.x, bluePos.x);
      vec3 Y = vec3(redPos.y, greenPos.y, bluePos.y);

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
          if (redPos.y >= begin && redPos.y < end) {
            X.r = redPos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          }
          if (greenPos.y >= begin && greenPos.y < end) {
            X.g = greenPos.x - sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          }
          if (bluePos.y >= begin && bluePos.y < end) {
            X.b = bluePos.x + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y + args${this.id}.y;
          }
        } else {
          if (redPos.x >= begin && redPos.x < end) {
            Y.r = redPos.y + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          }
          if (greenPos.x >= begin && greenPos.x < end) {
            Y.g = greenPos.y - sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y;
          }
          if (bluePos.x >= begin && bluePos.x < end) {
            Y.b = bluePos.y + sin(tmod * args${this.id}.x * pi) * 0.1 * dir * args${this.id}.y + args${this.id}.y;
          }
        }
      }

      redPos = vec2(X.r, Y.r);
      greenPos = vec2(X.g, Y.g);
      bluePos = vec2(X.b, Y.b);
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