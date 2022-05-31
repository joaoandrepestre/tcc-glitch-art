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

  defineWebcamSource(stream: MediaStream): Promise<Dimensions> {
    this.source.set(SourceType.UNSET, null);
    let data = document.createElement('video');
    data.muted = true;
    data.onloadeddata = () => {
      this.source.set(SourceType.WEBCAM, data);
      this.defineTexture(-1);
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

  addEffect(effectType: string): EffectMetadata {
    return this.effectsChain.addEffect(effectType); // SHOULD RETURN NEW EFFECT's METADATA
  }

  editEffect(id: number, params: object): EffectMetadata {
    return this.effectsChain.editEffect(id, params); // SHOULD RETURN EDITED METADATA
  }

  removeEffect(effectId: number): void {
    this.effectsChain.removeEffect(effectId);
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
        this.effectsChain.apply(this.texture);
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
      case 'webcam':
        source_result = Promise.resolve('webcam-request');
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

  export(): ExportedState {
    return {
      source: this.source.export(),
      effects: this.effectsChain.export(),
    };
  }
}