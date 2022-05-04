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

  static createSelector(options, ignore = '', callback = () => { }) {
    const selector = document.createElement('select');
    for (const i in options) {
      const option = options[i];
      if (option === ignore) continue;
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

  static updateEffectEditorLabels(paramId, newLabels) {
    let param = document.getElementById(paramId);
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
    this.texture = null;
    this.out_texture = null;

    this.updated = false;
    this.image_loaded = false;
  }

  initStaticZone(regl) {
    this.createImageUploader(regl);
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
    file_input.accept = 'image/*';
    file_input.hidden = true;

    const button = Gui.createSubmitButton((_) => {
      if (!file_input.value.length) return;

      let reader = new FileReader();

      let file = file_input.files[0];
      reader.onload = (event) => {
        let str = event.target.result;
        let src_image = new Image();
        src_image.onload = (e) => {
          let w = e.target.width;
          let h = e.target.height;
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

          this.texture = regl.texture({ data: src_image, flipY: true });
          //this.texture.resize(w, h);
          this.canvas.width = w;
          this.canvas.height = h;
          this.image_loaded = true;
          this.updated = true;
        };
        src_image.src = str;
      };

      reader.readAsDataURL(file);
    });
    button.hidden = true;
    file_input.addEventListener('change', () => button.click());
    form.appendChild(file_input);

    form.appendChild(button);
    div.appendChild(form);

    const main_button = document.createElement('button');
    main_button.innerHTML = 'Open...'
    main_button.addEventListener('click', () => file_input.click());
    div.appendChild(main_button);

    this.file_zone.appendChild(div);
  }

  createImageDownloader() {
    const div = document.createElement('div');
    div.setAttribute('class', 'image-downloader');
    const button = document.createElement('button');
    button.innerHTML = 'Save...';
    button.addEventListener('click', () => {
      if (!this.image_loaded || !this.fx_chain.modified()) return;
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
    const selector = Gui.createSelector(Object.keys(EffectsChain.fx_reg), 'identity');
    selector.setAttribute('id', 'fx_selector');
    form.appendChild(selector);

    const button = Gui.createSubmitButton((_) => {
      if (!this.image_loaded) return;
      const fx = this.fx_chain.addEffect(fx_selector.value);
      this.createEffectEditor(fx);
      this.updated = true;
    });
    button.innerHTML = 'Add Effect';
    form.appendChild(button);

    div.appendChild(form);
    this.static_zone.appendChild(div);
  }

  createEffectEditor(fx) {

    // background div
    const div = document.createElement('div');
    div.setAttribute('class', 'effect-editor');
    Gui.addLabel(div, fx.constructor.name);

    // delete button
    const delete_button = document.createElement('button');
    delete_button.setAttribute('class', 'delete_button');
    delete_button.innerHTML = 'X'
    delete_button.addEventListener('click', (event) => {
      this.fx_chain.removeEffect(fx);
      this.dynamic_zone.removeChild(div);
      this.updated = true;
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
      this.updated = true;
    };

    // param editors
    const fx_params = Object.getOwnPropertyDescriptors(fx);
    for (const key in fx_params) {
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
          const selector = Gui.createSelector(param.value['options'], '', callback);
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

  update() {
    this.out_texture = this.fx_chain.apply(this.texture);
    this.updated = false;
  }
}

export { Gui };

