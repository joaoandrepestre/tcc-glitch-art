import { DrawCommand, DrawConfig, Regl, Texture } from "regl";
import { Effect, EffectMetadata, ExportedEffect } from './effect';
import Noise from "./noise";
import Filter from "./filter";
import Mapper from "./mapper";
import Wobble from "./wobble";
import { randomInt } from "../utils";

interface EffectConstructor {
  new(id: number): Effect;
}

type EffecstRegistry = {
  [key: string]: EffectConstructor;
};

type PartialShaderCode = {
  vars: string;
  main: string;
};

// Chain of effects to be applied in order
export default class EffectsChain {

  static fx_reg: EffecstRegistry = {};

  static createRandomEffect = (): ExportedEffect => {
    const fx_reg_types = Object.keys(EffectsChain.fx_reg);
    const fx_reg_length = fx_reg_types.length;
    let t = randomInt(0, fx_reg_length - 1);
    let type = fx_reg_types[t];

    const effect = new EffectsChain.fx_reg[type](0);
    effect.randomizeParams();
    effect.disabled = false;

    return effect.export();
  };

  regl: Regl;
  fx_chain: Effect[];
  nextId: number;
  flipX: number;
  regl_command: DrawCommand;

  constructor(regl: Regl) {
    EffectsChain.fx_reg['noise'] = Noise;
    EffectsChain.fx_reg['filter'] = Filter;
    EffectsChain.fx_reg['mapper'] = Mapper;
    EffectsChain.fx_reg['wobble'] = Wobble;

    this.regl = regl;
    this.fx_chain = [];
    this.nextId = 0;
    this.flipX = 1;

    this.regl_command = null;
    this.defineReglCommand();
  }

  defineFragShader(partialShaderCode: PartialShaderCode): string {
    return `
      precision mediump float;
      uniform sampler2D texture;
      uniform float time;
      varying vec2 uv;
      ${partialShaderCode.vars}

      void main() {
        vec4 sample = texture2D(texture, uv);
        vec3 color = vec3(sample);
        float alpha = sample.w;
        ${partialShaderCode.main}
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  defineVertShader(partialShaderCode: PartialShaderCode): string {
    return `
      precision mediump float;
      attribute vec2 position;
      uniform float time;
      uniform float flipX;
      varying vec2 uv;
      ${partialShaderCode.vars}

      void main() {
        uv = 0.5 + 0.5 * position;
        vec2 pos = position;
        pos.x = flipX * pos.x;
        ${partialShaderCode.main}
        gl_Position = vec4(pos, 0, 1.0);
      }
    `;
  }

  defineReglCommand(): void {
    let config_part = this.fx_chain
      .reduce((accConfig, fx) => {

        accConfig.uniforms = {
          ...accConfig.uniforms,
          ...fx.config.uniforms
        };

        accConfig.frag_shader.vars += fx.getFragShaderVars();
        accConfig.frag_shader.main += fx.getFragShaderMain();

        accConfig.vert_shader.vars += fx.getVertShaderVars();
        accConfig.vert_shader.main += fx.getVertShaderMain();

        return accConfig;
      }, {
        uniforms: {},
        frag_shader: { vars: '', main: '' },
        vert_shader: { vars: '', main: '' }
      });

    let frag = this.defineFragShader(config_part.frag_shader);
    let vert = this.defineVertShader(config_part.vert_shader);

    let config: DrawConfig = {
      ...Effect.basicConfig,
      uniforms: {
        ...Effect.basicConfig.uniforms,
        ...config_part.uniforms
      },
      frag,
      vert
    };

    this.regl_command = this.regl(config);
  }

  modified(): boolean {
    return this.fx_chain.length > 0;
  }

  // Adds a new instance of the chosen effect
  addEffect(effect_name: string): EffectMetadata {
    if (!(effect_name in EffectsChain.fx_reg)) throw new Error(`Attempting to add unregistered effect ${effect_name}`);

    const fx = new EffectsChain.fx_reg[effect_name](this.nextId++);
    this.fx_chain.push(fx);
    this.defineReglCommand();
    return fx.getMetadata();
  }

  editEffect(id: number, params: object): EffectMetadata {
    const index = this.fx_chain.findIndex(fx => fx.id === id);
    let fx = this.fx_chain[index];
    fx.setParams(params);
    return fx.getMetadata();
  }

  removeEffect(effectId: number): void {
    const index = this.fx_chain.findIndex(fx => fx.id === effectId);
    this.fx_chain.splice(index, 1);
    this.defineReglCommand();
  }

  reorderEffects(index1: number, index2: number): EffectMetadata[] {
    const res = Array.from(this.fx_chain);
    const [removed] = res.splice(index1, 1);
    res.splice(index2, 0, removed);

    this.fx_chain = res;
    this.defineReglCommand();

    return this.getMetadatas();
  }

  reset(): void {
    this.fx_chain = [];
    this.nextId = 0;
    this.flipX = 1;
    this.defineReglCommand();
  }

  getMetadatas(): EffectMetadata[] {
    return this.fx_chain.map(effect => effect.getMetadata());
  }

  export(): ExportedEffect[] {
    return this.fx_chain.map(fx => fx.export());
  }

  import(effects: ExportedEffect[]): EffectMetadata[] {
    let metadatas = [];
    effects.forEach(fx_info => {
      let metadata = this.addEffect(fx_info.type);
      metadata = this.editEffect(metadata.id, fx_info.params);
      metadatas.push(metadata);
    });
    return metadatas;
  }

  // Applies all effects, in order, to the src_image
  apply(texture: Texture): void {
    let params = this.fx_chain
      .map(fx => fx.getParams())
      .reduce((accParams, params) => {
        return {
          ...accParams,
          ...params
        };
      }, {});
    this.regl_command({ texture, ...params, flipX: this.flipX });
  }
}