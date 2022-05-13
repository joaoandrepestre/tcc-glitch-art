import { EffectsChain } from "./effects/effects_chain.js";
import { Source, SourceType } from "./source.js";

class Core {
  constructor(canvas) {
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    this.regl = createREGL(gl);

    this.source = new Source();
    this.effectsChain = new EffectsChain(this.regl);

    this.texture = null;
  }

  sourceLoaded() {
    return this.source.isLoaded();
  }

  modified() {
    return this.effectsChain.modified();
  }

  defineTexture() {
    if (this.texture !== null) this.texture.destroy();
    this.texture = this.regl.texture({ data: this.source.sourceData, flipY: true });
  }

  defineImageSource(dataURL) {
    this.source.set(SourceType.UNSET, null);
    let data = new Image();
    data.onload = () => {
      this.source.set(SourceType.IMG, data);
      this.defineTexture();
    };
    data.src = dataURL;
    return this.source.getDimensions();
  }

  defineVideoSource(dataURL) {
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

  defineWebcamSource(stream) {
    this.source.set(SourceType.UNSET, null);
    let data = document.createElement('video');
    data.muted = true;
    data.onloadeddata = () => {
      this.source.set(SourceType.WEBCAM, data);
      this.defineTexture();
      data.play(); // maybe change ??
    };
    data.srcObject = stream;
    data.load();
    return this.source.getDimensions();
  }

  getRegisteredEffects() {
    return Object.keys(EffectsChain.fx_reg);
  }

  addEffect(effectType) {
    return this.effectsChain.addEffect(effectType); // SHOULD RETURN NEW EFFECT's METADATA
  }

  editEffect(id, params) {
    return this.effectsChain.editEffect(id, params); // SHOULD RETURN EDITED METADATA
  }

  removeEffect(effect) {
    this.effectsChain.removeEffect(effect);
  }

  update(bgColor) {
    this.regl.frame(() => {
      this.regl.clear({
        color: bgColor
      });

      if (this.source.isLoaded()) {
        if (this.source.isVideo()) {
          this.defineTexture();
        }
        this.effectsChain.apply(this.texture);
      }
    });
  }

  export() {
    return {
      source: this.source.export(),
      effects: this.effectsChain.export(),
    };
  }
}

export { Core };