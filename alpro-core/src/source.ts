import { wait } from './utils';

const MAX_TRIES = 10;

export type Dimensions = {
  width: number;
  height: number;
};

type SourceData = HTMLVideoElement | HTMLImageElement;

export type ExportedSource = {
  type: string;
  data: string;
};

export class SourceType {
  static IMG = new SourceType('img');
  static VID = new SourceType('vid');
  static WEBCAM = new SourceType('webcam');
  static UNSET = new SourceType(null);

  name: string;

  constructor(name) {
    this.name = name;
  }
}

export class Source {
  sourceType: SourceType;
  sourceData: SourceData;

  constructor() {
    this.sourceType = SourceType.UNSET;
    this.sourceData = null;
  }

  set(sourceType: SourceType, sourceData: SourceData) {
    if (!(sourceType instanceof SourceType)) throw new Error('Invalid or unsupported source');

    this.sourceType = sourceType;
    this.sourceData = sourceData;
  }

  isLoaded(): boolean {
    return this.sourceType !== SourceType.UNSET;
  }

  isVideo(): boolean {
    return this.sourceType === SourceType.VID || this.sourceType === SourceType.WEBCAM;
  }

  isWebcam(): boolean {
    return this.sourceType === SourceType.WEBCAM;
  }

  getDimensions(): Promise<Dimensions> {
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
            width: this.sourceData.width || this.sourceData['videoWidth'],
            height: this.sourceData.height || this.sourceData['videoHeight'],
          });
        }

        reject(null);
      })();
    });
  }

  export(): ExportedSource {
    return {
      type: this.sourceType.name,
      data: this.sourceData.src,
    };
  }
}
