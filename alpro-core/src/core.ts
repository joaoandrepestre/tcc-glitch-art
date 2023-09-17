const createREGL = require('regl');
import { Regl, Texture } from 'regl';
import { EffectMetadata, ExportedEffect } from './effects/effect.js';
import EffectsChain from './effects/effects_chain.js';
import { Dimensions, ExportedSource, Source, SourceType } from './source.js';

type ExportedState = {
  source: ExportedSource;
  effects: ExportedEffect[];
};

type ImportResult = {
  source_result: Promise<Dimensions | string>;
  effects_metadatas: EffectMetadata[]
};

export default class Core {
  regl: Regl;
  source: Source;
  effectsChain: EffectsChain;
  texture: Texture;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    this.regl = createREGL(gl);

    this.source = new Source();
    this.effectsChain = new EffectsChain(this.regl);

    this.texture = null;
  }

  sourceLoaded(): boolean {
    return this.source.isLoaded();
  }

  modified(): boolean {
    return this.effectsChain.modified();
  }

  defineTexture(flipX: number = 1) {
    if (this.texture !== null) this.texture.destroy();
    this.texture = this.regl.texture({ data: this.source.sourceData, flipY: true });
    this.effectsChain.flipX = flipX;
  }

  defineImageSource(dataURL: string): Promise<Dimensions> {
    this.source.set(SourceType.UNSET, null);
    let data = new Image();
    data.onload = () => {
      this.source.set(SourceType.IMG, data);
      this.defineTexture();
    };
    data.src = dataURL;
    return this.source.getDimensions();
  }

  defineVideoSource(dataURL: string): Promise<Dimensions> {
    this.source.set(SourceType.UNSET, null);
    let data = document.createElement('video');
    data.muted = true;
    data.loop = true;
    data.onloadeddata = () => {
      this.source.set(SourceType.VID, data);
      this.defineTexture();
      data.play(); // maybe change ??
    };
    data.src = dataURL;
    data.load();
    return this.source.getDimensions();
  }

  defineInputStreamSource(stream: MediaStream, isWebcam: boolean): Promise<Dimensions> {
    this.source.set(SourceType.UNSET, null);
    let data = document.createElement('video');
    data.muted = true;
    data.onloadeddata = () => {
      let srcType = isWebcam ? SourceType.WEBCAM : SourceType.INPUT_STREAM;
      this.source.set(srcType, data);
      this.defineTexture(srcType.flipX);
      data.play(); // maybe change ??
    };
    data.srcObject = stream;
    data.load();
    return this.source.getDimensions();
  }

  getRegisteredEffects(): string[] {
    return Object.keys(EffectsChain.fx_reg);
  }

  getEffectMetadatas(): EffectMetadata[] {
    return this.effectsChain.getMetadatas();
  }

  getExportedSource() {
    return this.source.export();
  }

  getExportedEffects() {
    return this.effectsChain.export();
  }

  getShouldChunk(): boolean {
    return this.effectsChain.shouldChunk;
  }

  setShouldChunk(flag: boolean): void {
    this.effectsChain.setShouldChunk(flag);
  }

  addEffect(effectType: string): EffectMetadata {
    return this.effectsChain.addEffect(effectType); // SHOULD RETURN NEW EFFECT's METADATA
  }

  editEffect(id: number, params: object): EffectMetadata {
    return this.effectsChain.editEffect(id, params); // SHOULD RETURN EDITED METADATA
  }

  removeEffect(effectId: number): void {
    this.effectsChain.removeEffect(effectId);
  }

  createRandomEffect(): ExportedEffect {
    return EffectsChain.createRandomEffect();
  }

  reorderEffects(index1: number, index2: number): EffectMetadata[] {
    return this.effectsChain.reorderEffects(index1, index2);
  }

  update(bgColor: createREGL.Vec4) {
    this.regl.frame(() => {
      this.regl.clear({
        color: bgColor
      });

      if (this.source.isLoaded()) {
        if (this.source.isVideo()) {
          let flipX = this.source.isWebcam() ? -1 : 1;
          this.defineTexture(flipX);
        }
        this.effectsChain.apply(this.texture, { width: this.texture.width, height: this.texture.height });
      }
    });
  }

  resetState(): void {
    this.source.set(SourceType.UNSET, null);
    this.texture = null;
    this.effectsChain.reset();
  }

  import(settings: ExportedState): ImportResult {
    let s = settings.source;
    let source_result;
    switch (s.type) {
      case 'img':
        source_result = this.defineImageSource(s.data);
        break;
      case 'vid':
        source_result = this.defineVideoSource(s.data);
        break;
      case 'input-stream':
        source_result = Promise.resolve('input-stream-request');
      case 'webcam':
        source_result = Promise.resolve('webcam-request');
        break;
      case null:
      case 'unset':
      case 'null':
        source_result = Promise.resolve({ width: 512, height: 512 });
        break;
      default:
        throw new Error('Invalid or unsupported source');
    }

    this.effectsChain = new EffectsChain(this.regl);
    let effects_metadatas = this.effectsChain.import(settings.effects);

    return {
      source_result,
      effects_metadatas
    };
  }

  importEffects(settings: ExportedEffect[]): EffectMetadata[] {
    this.effectsChain = new EffectsChain(this.regl);
    return this.effectsChain.import(settings);
  }

  appendEffects(settings: ExportedEffect[]): EffectMetadata[] {
    return this.effectsChain.import(settings);
  }

  export(): ExportedState {
    return {
      source: this.source.export(),
      effects: this.effectsChain.export(),
    };
  }
}