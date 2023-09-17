import { DrawCommand, DrawConfig, Regl, Texture } from "regl";
import { Effect, EffectMetadata, ExportedEffect, ColorEffect, PositionEffect } from './effect';
import Noise from "./noise";
import Filter from "./filter";
import Mapper from "./mapper";
import Wobble from "./wobble";
import { randomInt } from "../utils";
import Tilt from "./tilt";
import Pixelate from "./pixelate";
import { Dimensions } from "../source";

interface EffectConstructor {
  new(id: number): Effect;
}

type EffecstRegistry = {
  [key: string]: EffectConstructor;
};

type PartialShaderCode = {
  vars: string;
  posTransforms: string;
  colorTransforms: string;
};

type EffectChunks = {
  chunks: Effect[][];
  currIndex: number;
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
  fx_chunks: EffectChunks;
  nextId: number;
  flipX: number;
  identity: DrawCommand;
  regl_commands: DrawCommand[];
  shouldChunk: boolean;

  constructor(regl: Regl) {
    EffectsChain.fx_reg['noise'] = Noise;
    EffectsChain.fx_reg['filter'] = Filter;
    EffectsChain.fx_reg['mapper'] = Mapper;
    EffectsChain.fx_reg['wobble'] = Wobble;
    EffectsChain.fx_reg['tilt'] = Tilt;
    EffectsChain.fx_reg['pixelate'] = Pixelate;

    this.regl = regl;
    this.fx_chain = [];
    this.fx_chunks = { chunks: [], currIndex: 0 };
    this.nextId = 0;
    this.flipX = 1;
    this.shouldChunk = false;

    this.identity = this.regl({
      ...Effect.basicConfig,
      frag: this.defineFragShader({ vars: '', posTransforms: '', colorTransforms: '' }),
      vert: this.defineVertShader({ vars: '', posTransforms: '', colorTransforms: '' })
    });
    this.regl_commands = [];
    this.defineReglCommand();
  }

  

  defineFragShader(partialShaderCode: PartialShaderCode): string {
    return `
      precision mediump float;
      uniform sampler2D texture;
      uniform float time;
      uniform vec2 dimensions;
      varying vec2 uv;
      ${partialShaderCode.vars}

      void main() {
        float t = mod(time, 60.0);
        float random = fract(sin(dot(uv + t, vec2(12.9898,78.233)))*43758.5453123);
        float pi = 3.1415926538;
        
        vec2 redPos = uv;
        vec2 greenPos = uv;
        vec2 bluePos = uv;
        ${partialShaderCode.posTransforms}

        vec4 red = texture2D(texture, redPos);
        float green = texture2D(texture, greenPos).y;
        float blue = texture2D(texture, bluePos).z;
        vec3 color = vec3(red.x, green, blue);
        float alpha = red.w;
        ${partialShaderCode.colorTransforms}
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

      void main() {
        uv = 0.5 + 0.5 * position;
        vec2 pos = position;
        pos.x = flipX * pos.x;
        gl_Position = vec4(pos, 0, 1.0);
      }
    `;
  }

  defineReglCommand(): void {
    this.fx_chunks = this.fx_chain.reduce(
      (chunked: EffectChunks, item: Effect, idx: number) => {
        if (this.shouldChunk && item instanceof PositionEffect && idx !== 0) chunked.currIndex++;

        let chunkIndex = chunked.currIndex;

        if (!chunked.chunks[chunkIndex]) {
          chunked.chunks[chunkIndex] = [];
        }
        chunked.chunks[chunkIndex].push(item);

        return chunked;
      }, { chunks: [], currIndex: 0 });
    let commands = this.fx_chunks.chunks.map((effects: Effect[]) => {
      let config_part = effects
        .reduce((accConfig, fx) => {

          accConfig.uniforms = {
            ...accConfig.uniforms,
            ...fx.config.uniforms
          };

          accConfig.frag_shader.vars += fx.getFragShaderVars();
          //accConfig.frag_shader.main += fx.getFragShaderMain();
          accConfig.frag_shader.posTransforms += fx.getFragShaderPosTransform();
          accConfig.frag_shader.colorTransforms += fx.getFragShaderColorTransform();

          accConfig.vert_shader.vars += fx.getVertShaderVars();
          //accConfig.vert_shader.main += fx.getVertShaderMain();

          return accConfig;
        }, {
          uniforms: {},
          frag_shader: { vars: '', main: '', posTransforms: '', colorTransforms: '' },
          vert_shader: { vars: '', main: '', posTransforms: '', colorTransforms: '' }
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

      return this.regl(config);
    });
    this.regl_commands = commands.length > 0 ? commands : [this.identity];
  }

  modified(): boolean {
    return this.fx_chain.length > 0;
  }

  setShouldChunk(flag: boolean): void {
    this.shouldChunk = flag;
    this.defineReglCommand();
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
  apply(texture: Texture, dimensions: Dimensions): void {
    let chunkedParams = this.fx_chunks.chunks
      .map(chunk => {
        return chunk.map(fx => fx.getParams())
          .reduce((accParams, params) => {
            return {
              ...accParams,
              ...params
            };
          }, {});
      });
    let textures = [texture, null];
    this.regl_commands.forEach((command, idx) => {
      let i = idx % 2;
      let params = chunkedParams[idx];
      let flip = idx === 0 ? this.flipX : 1; // should only flipX on first command
      command({ texture: textures[i], ...params, flipX: flip, dimensions: Object.values(dimensions) });
      if (idx < this.regl_commands.length - 1) // should not create new texture for last command
        textures[(i + 1) % 2] = this.regl.texture({
          width: textures[i].width,
          height: textures[i].height,
          copy: true
        });
      if (idx != 0) // should not destroy original texture
        textures[i].destroy();
      textures[i] = null;
    });
  }
}