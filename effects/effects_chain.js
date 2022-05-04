import { Effect } from "./effect.js";
import { Noise } from "./noise.js";
import { Filter } from "./filter.js";
import { Mapper } from "./mapper.js";
import { Wobble } from "./wobble.js";

// Chain of effects to be applied in order
class EffectsChain {

  static fx_reg = {};

  constructor(regl) {
    EffectsChain.fx_reg['noise'] = Noise;
    EffectsChain.fx_reg['filter'] = Filter;
    EffectsChain.fx_reg['mapper'] = Mapper;
    EffectsChain.fx_reg['wobble'] = Wobble;

    this.regl = regl;
    this.fx_chain = [];
    this.regl_command = null;
    this.defineReglCommand();
  }

  defineFragShader(partialShaderCode) {
    return `
      precision mediump float;
      uniform sampler2D texture;
      varying vec2 uv;
      ${partialShaderCode.vars}

      void main() {
        vec3 color = vec3(texture2D(texture, uv));
        ${partialShaderCode.main}
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  defineVertShader(partialShaderCode) {
    return `
      precision mediump float;
      attribute vec2 position;
      varying vec2 uv;
      ${partialShaderCode.vars}

      void main() {
        uv = 0.5 + 0.5 * position;
        vec2 pos = position;
        ${partialShaderCode.main}
        gl_Position = vec4(pos, 0, 1.0);
      }
    `;
  }

  defineReglCommand() {
    let config_part = this.fx_chain
      .map(fx => fx.config)
      .reduce((accConfig, config) => {
        if (config === undefined) return accConfig;

        accConfig.uniforms = {
          ...accConfig.uniforms,
          ...config.uniforms
        };
        if (config.frag_shader !== undefined) {
          accConfig.frag_shader.vars += config.frag_shader.vars;
          accConfig.frag_shader.main += config.frag_shader.main;
        }

        if (config.vert_shader !== undefined) {
          accConfig.vert_shader.vars += config.vert_shader.vars;
          accConfig.vert_shader.main += config.vert_shader.main;
        }

        return accConfig;
      }, {
        uniforms: {},
        frag_shader: { vars: '', main: '' },
        vert_shader: { vars: '', main: '' }
      });

    let frag = this.defineFragShader(config_part.frag_shader);
    let vert = this.defineVertShader(config_part.vert_shader);

    let config = {
      ...Effect.basicConfig,
      uniforms: {
        ...Effect.basicConfig.uniforms,
        ...config_part.uniforms
      },
      frag,
      vert
    };

    console.log(config);
    this.regl_command = this.regl(config);
  }

  modified() {
    return this.fx_chain.length > 1;
  }

  // Adds a new instance of the chosen effect
  addEffect(effect_name) {
    if (!(effect_name in EffectsChain.fx_reg)) throw new Error(`Attempting to add unregistered effect ${effect_name}`);

    const id = this.fx_chain.length;
    const fx = new EffectsChain.fx_reg[effect_name](id);
    this.fx_chain.push(fx);
    this.defineReglCommand();
    return fx;
  }

  removeEffect(effect) {
    const index = this.fx_chain.findIndex(fx => fx === effect);
    this.fx_chain.splice(index, 1);
    this.defineReglCommand();
  }

  // Applies all effects, in order, to the src_image
  apply(texture) {
    let params = this.fx_chain
      .map(fx => fx.getParams())
      .reduce((accParams, params) => {
        return {
          ...accParams,
          ...params
        };
      }, {});
    this.regl_command({ texture, ...params });
  }
}

export { EffectsChain };