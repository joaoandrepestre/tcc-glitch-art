import { tryGetValue } from "../utils.js";
import { EffectsChain } from "../effects/effects_chain.js";


class Gui {
  static createSubmitButton(callback) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      return callback(event);
    });
    return button;
  }

  static createSlider(min, max, callback) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.addEventListener('change', callback);
    return slider;
  }

  static createCheckbox(callback) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = false;
    checkbox.checked = false;
    checkbox.addEventListener('change', (event) => {
      checkbox.value = checkbox.checked;
      return callback(event)
    });
    return checkbox;
  }

  static createSelector(options, callback = () => { }) {
    const selector = document.createElement('select');
    for (const i in options) {
      const option = options[i];
      const opt = document.createElement('option');
      opt.value = option;
      opt.innerHTML = option;
      selector.appendChild(opt);
    }
    selector.addEventListener('change', callback);
    return selector;
  }

  static newLine(parent) {
    parent.appendChild(document.createElement('br'));
  }

  static addLabel(parent, label) {
    let s = label.replace('_', ' ').toUpperCase();
    const l = document.createElement('label');
    l.innerHTML = s;
    parent.appendChild(l);
  }

  static updateEffectEditorLabels(effectId, paramId, newLabels) {
    let effectDiv = document.getElementById(effectId);
    let param = effectDiv.querySelector(`#${paramId}`);
    let paramLabel = paramId.replace('_', ' ').toUpperCase();
    let labels = param.querySelectorAll('label');
    Object.values(labels)
      .filter(l => l.innerHTML !== paramLabel)
      .forEach((l, i) => {
        l.innerHTML = newLabels[i];
      });
  }

  constructor(regl, fx_chain) {
    this.fx_chain = fx_chain;
    this.static_zone = document.getElementById('gui_static');
    this.file_zone = document.getElementById('file_zone');
    this.canvas = document.getElementById('canvas');
    this.initStaticZone(regl);
    this.dynamic_zone = document.getElementById('gui_dynamic');

    this.src_webcam = null;
    this.src_video = null;
    this.texture = null;

    this.image_loaded = false;
    this.video_loaded = false;
    this.webcam_loaded = false;
  }

  initStaticZone(regl) {
    this.createImageUploader(regl);
    this.createWebcamSelector(regl);
    this.createImageDownloader();
    this.createEffectSelector();
  }

  createImageUploader(regl) {
    const div = document.createElement('div');
    div.setAttribute('class', 'image-uploader');
    const form = document.createElement('form');

    const file_input = document.createElement('input');
    file_input.id = 'file_input';
    file_input.type = 'file';
    file_input.accept = 'image/*, video/*';
    file_input.hidden = true;

    const button = Gui.createSubmitButton((_) => {
      if (!file_input.value.length) return;

      let reader = new FileReader();

      let file = file_input.files[0];
      reader.onload = (event) => {
        let str = event.target.result;
        let src = null;
        let onload = (e) => {
          let w = e.target.width || e.target.videoWidth;
          let h = e.target.height || e.target.videoHeight;
          const maxW = window.innerWidth;
          const maxH = window.innerHeight;

          //if (w > h) {
          //  if (w > maxW) {
          //    h = h * (maxW / w);
          //    w = maxW;
          //  }
          //} else {
          //  if (h > maxH) {
          //    w = w * (maxH / h);
          //    h = maxH;
          //  }
          //}

          this.texture = regl.texture({ data: src, flipY: true });
          this.canvas.width = w;
          this.canvas.height = h;
          this.image_loaded = false;
          this.video_loaded = false;
          this.webcam_loaded = false;
          if (this.src_webcam != null)
            this.src_webcam.getTracks()[0].stop();
          this.src_video = null;
        };

        if (file.type.startsWith('video')) {
          src = document.createElement('video');
          src.muted = true;
          src.loop = true;
          src.src = str;
          src.onloadeddata = (e) => {
            onload(e);
            src.play();
            this.src_video = src;
            this.video_loaded = true;
          };
          src.load();
        } else {
          src = new Image();
          src.onload = (e) => {
            onload(e);
            this.image_loaded = true;
          };
          src.src = str;
        }

        file_input.value = null;
      };

      reader.readAsDataURL(file);
    });
    button.hidden = true;
    file_input.addEventListener('change', () => button.click());
    form.appendChild(file_input);

    form.appendChild(button);
    div.appendChild(form);

    const main_button = document.createElement('button');
    main_button.innerHTML = 'Open File...'
    main_button.addEventListener('click', () => file_input.click());
    div.appendChild(main_button);

    this.file_zone.appendChild(div);
  }

  createWebcamSelector(regl) {
    const div = document.createElement('div');
    div.setAttribute('class', 'webcam-button');
    const button = document.createElement('button');
    button.innerHTML = 'Open Webcam';
    button.addEventListener('click', () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            this.src_webcam = stream;
            let src = document.createElement('video');
            src.muted = true;
            src.srcObject = stream;
            src.onloadeddata = (e) => {
              let w = e.target.width || e.target.videoWidth;
              let h = e.target.height || e.target.videoHeight;

              this.texture = regl.texture({ data: src, flipY: true });
              this.canvas.width = w;
              this.canvas.height = h;
              this.image_loaded = false;
              this.video_loaded = false;
              src.play();
              this.src_video = src;
              this.webcam_loaded = true;
            };
            src.load();
          })
          .catch(err => console.log(err));
      }
    });
    div.appendChild(button);
    this.file_zone.appendChild(div);
  }

  createImageDownloader() {
    const div = document.createElement('div');
    div.setAttribute('class', 'image-downloader');
    const button = document.createElement('button');
    button.innerHTML = 'Save as Image...';
    button.addEventListener('click', () => {
      if (!this.srcLoaded() || !this.fx_chain.modified()) return;
      let link = document.createElement('a');
      link.download = 'output_image.png';
      link.href = document.getElementById('canvas').toDataURL('image/png');
      link.click();
    });
    div.appendChild(button);
    this.file_zone.appendChild(div);
  }

  createEffectSelector() {
    const div = document.createElement('div');
    div.setAttribute('class', 'effect-selector');
    const form = document.createElement('form');
    const selector = Gui.createSelector(Object.keys(EffectsChain.fx_reg));
    selector.setAttribute('id', 'fx_selector');
    form.appendChild(selector);

    const button = Gui.createSubmitButton((_) => {
      if (!this.srcLoaded()) return;
      const fx = this.fx_chain.addEffect(fx_selector.value);
      this.createEffectEditor(fx);
    });
    button.innerHTML = 'Add Effect';
    form.appendChild(button);

    div.appendChild(form);
    this.static_zone.appendChild(div);
  }

  createEffectEditor(fx) {

    // background div
    const div = document.createElement('div');
    div.id = fx.id;
    div.setAttribute('class', 'effect-editor');
    Gui.addLabel(div, fx.constructor.name);

    // delete button
    const delete_button = document.createElement('button');
    delete_button.setAttribute('class', 'delete_button');
    delete_button.innerHTML = 'X'
    delete_button.addEventListener('click', (event) => {
      this.fx_chain.removeEffect(fx);
      this.dynamic_zone.removeChild(div);
    });
    div.appendChild(delete_button);

    Gui.newLine(div);

    // callback for any change in the params
    const callback = (event) => {
      event.preventDefault();

      const inputs = div.querySelectorAll('input, select');

      const params = {};
      inputs.forEach(input => {
        const [key, type, subkey] = input.id.split('#');

        if (type.startsWith('multi')) {
          let multi = tryGetValue(params, key, {});
          multi[subkey] = input.value / 100.0;
        } else {
          params[key] = input.value;
        }
      });

      fx.setParams(params);
    };

    // param editors
    const fx_params = Object.getOwnPropertyDescriptors(fx);
    for (const key in fx_params) {
      if (key === 'config' || key === 'id') continue;

      const param = fx_params[key];

      // background div
      const param_div = document.createElement('div');
      param_div.id = key;
      param_div.setAttribute('class', 'param_editor');
      Gui.addLabel(param_div, key);

      // multi type parameters, not simple numbers
      if (typeof param.value === 'object') {
        // multiple choice - select
        if ('options' in param.value) {
          const selector = Gui.createSelector(param.value['options'], callback);
          selector.id = `${key}#single`
          param_div.appendChild(selector);
        }
        else {
          // sliders for multi numbers
          for (const slider_key in param.value) {
            Gui.newLine(param_div);
            const v = param.value[slider_key];
            const slider = Gui.createSlider(0, 100, callback);
            slider.id = `${key}#multi#${slider_key}`
            slider.value = v * 100;
            Gui.addLabel(param_div, slider_key);
            param_div.appendChild(slider);
          }
        }
      }

      // Single number assumed to be a flag
      else if (typeof param.value === 'number') {
        const checkbox = Gui.createCheckbox(callback);
        checkbox.id = `${key}#single`;
        param_div.appendChild(checkbox);
        Gui.newLine(param_div);
      }
      div.appendChild(param_div);
    }

    this.dynamic_zone.appendChild(div);
  }

  srcLoaded() {
    return this.image_loaded || this.video_loaded || this.webcam_loaded;
  }

  update(regl) {
    if (this.srcLoaded()) {
      if (this.video_loaded || this.webcam_loaded) {
        this.texture = regl.texture({ data: this.src_video, flipY: true });
      }
      this.fx_chain.apply(this.texture);
    }
  }
}

export { Gui };

