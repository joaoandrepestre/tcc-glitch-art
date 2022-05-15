import { tryGetValue } from "../utils.js";
import { EffectsChain } from "../core/effects/effects_chain.js";
import { Core } from "../core/core.js";


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

  static createSelector(options, values = options, callback = () => { }) {
    const selector = document.createElement('select');
    for (const i in options) {
      const option = options[i];
      const opt = document.createElement('option');
      opt.value = values[i];
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
        l.innerHTML = newLabels[i].replace('_', ' ').toUpperCase();
      });
  }

  constructor(core) {
    this.core = core;

    this.static_zone = document.getElementById('gui_static');
    this.file_zone = document.getElementById('file_zone');
    this.canvas = document.getElementById('canvas');
    this.initStaticZone();
    this.dynamic_zone = document.getElementById('gui_dynamic');

    this.src_webcam = null;
  }

  initStaticZone() {
    this.createImageUploader();
    this.createWebcamSelector();
    this.createProjectUploader();
    this.createProjectDownloader();
    this.createImageDownloader();
    this.createEffectSelector();
  }

  resize(dimensions) {
    let w = dimensions.width;
    let h = dimensions.height;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;

    if (w > h) {
      if (w > maxW) {
        h = h * (maxW / w);
        w = maxW;
      }
    } else {
      if (h > maxH) {
        w = w * (maxH / h);
        h = maxH;
      }
    }

    this.canvas.width = w;
    this.canvas.height = h;
  }

  createImageUploader() {
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

        if (file.type.startsWith('video')) {
          this.core.defineVideoSource(str)
            .then(dimensions => this.resize(dimensions));
        } else {
          this.core.defineImageSource(str)
            .then(dimensions => this.resize(dimensions));
        }

        file_input.value = null;
        if (this.src_webcam != null)
          this.src_webcam.getTracks()[0].stop();
      };

      reader.readAsDataURL(file);
    });
    button.hidden = true;
    file_input.addEventListener('change', () => button.click());
    form.appendChild(file_input);

    form.appendChild(button);
    div.appendChild(form);

    const main_button = document.createElement('button');
    main_button.innerHTML = 'Open File...';
    main_button.addEventListener('click', () => file_input.click());
    div.appendChild(main_button);

    this.file_zone.appendChild(div);
  }

  createWebcamSelector() {
    const div = document.createElement('div');
    div.setAttribute('class', 'webcam-button');
    const button = document.createElement('button');
    button.innerHTML = 'Open Webcam';
    button.addEventListener('click', () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            this.core.defineWebcamSource(stream).then(dimensions => this.resize(dimensions));
            this.src_webcam = stream;
          })
          .catch(err => console.log(err));
      }
    });
    div.appendChild(button);
    this.file_zone.appendChild(div);
  }

  resetDynamicZone() {
    let child = this.dynamic_zone.firstElementChild;
    while (child) {
      this.dynamic_zone.removeChild(child);
      child = this.dynamic_zone.firstElementChild;
    }
  }

  createProjectUploader() {
    const div = document.createElement('div');
    div.setAttribute('class', 'image-uploader');
    const form = document.createElement('form');

    const file_input = document.createElement('input');
    file_input.id = 'file_input';
    file_input.type = 'file';
    file_input.accept = 'json';
    file_input.hidden = true;

    const button = Gui.createSubmitButton((_) => {
      if (!file_input.value.length) return;

      let reader = new FileReader();

      let file = file_input.files[0];
      reader.onload = (event) => {
        let str = event.target.result;
        let json = JSON.parse(str);
        console.log(json);
        let res = this.core.import(json);

        res.source_result.then(dimensions => this.resize(dimensions));

        this.resetDynamicZone();
        res.effects_metadatas.forEach(metadata => {
          this.createEffectEditor(metadata);
        });
        file_input.value = null;
      };

      reader.readAsText(file);
    });
    button.hidden = true;
    file_input.addEventListener('change', () => button.click());
    form.appendChild(file_input);

    form.appendChild(button);
    div.appendChild(form);

    const main_button = document.createElement('button');
    main_button.innerHTML = 'Load Project...';
    main_button.addEventListener('click', () => file_input.click());
    div.appendChild(main_button);

    this.file_zone.appendChild(div);
  }

  createProjectDownloader() {
    const div = document.createElement('div');
    div.setAttribute('class', 'downloader');
    const button = document.createElement('button');
    button.innerHTML = 'Save Project...';
    button.addEventListener('click', () => {
      if (!this.core.sourceLoaded() || !this.core.modified()) return;
      let link = document.createElement('a');
      link.download = 'project.json'
      link.href = `data:text/json;charset=utf-8,${encodeURI(JSON.stringify(this.core.export()))}`;
      link.click();
    });
    div.appendChild(button);
    this.file_zone.appendChild(div);
  }

  createImageDownloader() {
    const div = document.createElement('div');
    div.setAttribute('class', 'downloader');
    const button = document.createElement('button');
    button.innerHTML = 'Save as Image...';
    button.addEventListener('click', () => {
      if (!this.core.sourceLoaded() || !this.core.modified()) return;
      let link = document.createElement('a');
      link.download = 'output_image.png';
      link.href = document.getElementById('canvas').toDataURL('image/png');
      link.click();
    });
    div.appendChild(button);
    this.file_zone.appendChild(div);
  }

  createFramerateSlider() {
    const div = document.createElement('div');
    div.setAttribute('class', 'framerate')
    Gui.addLabel(div, 'framerate');
    const slider = Gui.createSlider(1, 60, () => {
      this.framerate = slider.value;
    });
    slider.value = this.framerate;
    div.appendChild(slider);

    this.static_zone.appendChild(div);
  }

  createEffectSelector() {
    const div = document.createElement('div');
    div.setAttribute('class', 'effect-selector');
    const form = document.createElement('form');
    const selector = Gui.createSelector(this.core.getRegisteredEffects());
    selector.setAttribute('id', 'fx_selector');
    form.appendChild(selector);

    const button = Gui.createSubmitButton((_) => {
      if (!this.core.sourceLoaded()) return;
      const metadata = this.core.addEffect(fx_selector.value);
      this.createEffectEditor(metadata);
    });
    button.innerHTML = 'Add Effect';
    form.appendChild(button);

    div.appendChild(form);
    this.static_zone.appendChild(div);
  }

  createEffectEditor(metadata) {

    // background div
    const div = document.createElement('div');
    div.id = metadata.id;
    div.setAttribute('class', 'effect-editor');
    Gui.addLabel(div, metadata.type);

    // delete button
    const delete_button = document.createElement('button');
    delete_button.setAttribute('class', 'delete_button');
    delete_button.innerHTML = 'X'
    delete_button.addEventListener('click', (event) => {
      this.core.removeEffect(metadata.id);
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
        let [key, type, subkey, subtype] = input.id.split('#');
        subtype = subtype === undefined ? subkey : subtype;

        if (type.startsWith('multi')) {
          let multi = tryGetValue(params, key, {});
          multi[subkey] = input.value / 100.0;
        } else if (subtype === 'boolean') {
          params[key] = input.value === 'true' ? true : false;
        } else if (subtype === 'number') {
          params[key] = input.value === 'true' ? -1.0 : 1.0;
        } else if (subtype === 'select') {
          params[key] = parseInt(input.value);
        }
      });

      let newMeta = this.core.editEffect(metadata.id, params);
      newMeta.params.forEach(param => {
        if (param.labels === undefined) return;
        Gui.updateEffectEditorLabels(newMeta.id, param.name, param.labels);
      });
    };

    // param editors
    metadata.params.forEach(param => {
      // background div
      const param_div = document.createElement('div');
      param_div.id = param.name;
      param_div.setAttribute('class', 'param_editor');
      Gui.addLabel(param_div, param.name);

      // multi type parameters, not simple numbers
      // multiple choice - select
      if (param.type === 'select') {
        const values = param.options.map((_, i) => i);
        const selector = Gui.createSelector(param.options, values, callback);
        selector.id = `${param.name}#single#${param.type}`
        selector.value = param.value;
        param_div.appendChild(selector);
      }
      // sliders for multi numbers
      if (param.type === 'multi') {
        for (let i = 0; i < param.value.length; i++) {
          Gui.newLine(param_div);
          const slider = Gui.createSlider(0, 100, callback);
          slider.id = `${param.name}#multi#${param.labels[i]}#${param.type}`
          slider.value = param.value[i] * 100;
          Gui.addLabel(param_div, param.labels[i]);
          param_div.appendChild(slider);
        }
      }

      // Single number assumed to be a flag
      else if (param.type === 'number' || param.type === 'boolean') {
        const checkbox = Gui.createCheckbox(callback);
        checkbox.id = `${param.name}#single#${param.type}`;
        checkbox.value = param.value;
        checkbox.checked = param.value;
        param_div.appendChild(checkbox);
        Gui.newLine(param_div);
      }
      div.appendChild(param_div);
    });

    this.dynamic_zone.appendChild(div);
  }

  update() {
    this.core.update([0.21, 0.27, 0.31, 1]);
  }
}

export { Gui };

