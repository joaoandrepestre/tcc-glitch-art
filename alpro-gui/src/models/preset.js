class Preset {

  static standardPresets = [
    new Preset("NoiseFilter",
      [
        {
          "type": "noise",
          "id": 0,
          "params": {
            "disabled": false,
            "noise_factor": { "red": 0.06, "green": 0, "blue": 1 }
          }
        },
        {
          "type": "filter",
          "id": 1,
          "params": {
            "disabled": false,
            "threshold": { "red": 0.86, "green": 0.53, "blue": 0.32 },
            "high_low": 1
          }
        }
      ], require('../static/presets/noisefilter.png')),
    new Preset("DoubleFilter", [
      {
        "type": "filter",
        "id": 2,
        "params": {
          "disabled": false,
          "threshold": { "red": 0.38, "green": 0.49, "blue": 0.39 },
          "high_low": 1
        }
      },
      {
        "type": "filter",
        "id": 3,
        "params": {
          "disabled": false, "threshold": { "red": 0.86, "green": 0.7, "blue": 0.5 },
          "high_low": -1
        }
      }], require('../static/presets/doublefilter.png')),
    new Preset("NoiseMapper", [
      {
        "type": "noise",
        "id": 4,
        "params": {
          "disabled": false,
          "noise_factor": { "red": 0.28, "green": 0, "blue": 0.1 }
        }
      },
      {
        "type": "mapper",
        "id": 5, "params": {
          "disabled": false,
          "color_ratio": { "hue": 1, "sat": 1, "light": 1 },
          "color_space": { "selected": 0 }
        }
      }], require('../static/presets/noisemapper.png')),
    new Preset("Full", [
      {
        "type": "pixelate",
        "id": 9,
        "params": {
          "disabled": false,
          "ratio": { "width": 0.93, "height": 0.93 },
        }
      },
      {
        "type": "mapper",
        "id": 5,
        "params": {
          "disabled": false,
          "color_ratio": { "hue": 1, "sat": 0.8, "light": 0.27 },
          "color_space": { "selected": 0 }
        }
      },
      {
        "type": "filter",
        "id": 6,
        "params": {
          "disabled": false,
          "threshold": { "red": 0.29, "green": 0.5, "blue": 0.52 },
          "high_low": 1
        }
      },
      {
        "type": "noise",
        "id": 4,
        "params": {
          "disabled": false,
          "noise_factor": { "red": 0.5, "green": 0.43, "blue": 0.33 }
        }
      },
      {
        "type": "wobble",
        "id": 7,
        "params": {
          "disabled": false,
          "args": { "freq": 0.99, "timeFreq": 1.0, "amp": 0.31 }
        }
      },
      {
        "type": "tilt",
        "id": 8,
        "params": {
          "disabled": false,
          "args": { "freq": 0.25, "amp": 0.82, "qty": 0.6 },
          "direction": 1.0,
        }
      }], require('../static/presets/full.png'))
  ];

  static createRandomPreset = (randomEffectGenerator) => {
    const n = Math.floor(Math.random() * 5) + 1;

    const effects = [];
    for (let i = 0; i < n; i++) {
      effects.push(randomEffectGenerator());
    }

    return new Preset("random", effects, null);
  };

  constructor(name, effects, preview) {
    this.name = name;
    this.effects = effects;
    this.preview = preview;
  }
}

export default Preset;