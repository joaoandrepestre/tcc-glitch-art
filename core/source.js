import { wait } from "../utils.js";

const MAX_TRIES = 10;

class SourceType {
  static IMG = new SourceType('img');
  static VID = new SourceType('vid');
  static WEBCAM = new SourceType('webcam');
  static UNSET = new SourceType(null);

  constructor(name) {
    this.name = name;
  }
}

class Source {
  constructor() {
    this.sourceType = SourceType.UNSET;
    this.sourceData = null;
  }

  set(sourceType, sourceData) {
    if (!(sourceType instanceof SourceType)) throw new Error('Invalid or unsupported source type');

    this.sourceType = sourceType;
    this.sourceData = sourceData;
  }

  isLoaded() {
    return this.sourceType !== SourceType.UNSET;
  }

  isVideo() {
    return this.sourceType === SourceType.VID || this.sourceType === SourceType.WEBCAM;
  }

  getDimensions() {
    return new Promise((resolve, reject) => {
      (async () => {
        let tries = 0;
        let debounce = 100;
        while (this.sourceType === SourceType.UNSET && tries < MAX_TRIES) {
          await wait(debounce);
          tries++;
          debounce *= 1.5;
        }

        if (this.sourceData !== null) {
          resolve({
            width: this.sourceData.width || this.sourceData.videoWidth,
            height: this.sourceData.height || this.sourceData.videoHeight,
          });
        }

        reject(null);
      })();
    });
  }

  export() {
    return {
      type: this.sourceType,
      data: this.sourceData.src,
    };
  }
}

export { Source, SourceType };