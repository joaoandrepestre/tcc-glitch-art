import { tryGetValue } from "../utils.js";
import { EffectsChain } from "../effects/effects_chain.js";


class Gui {
  constructor(regl, fx_chain) {
    this.fx_chain = fx_chain;
    this.static_zone = document.getElementById('gui_static');
    this.canvas = document.getElementById('canvas');
    this.initStaticZone(regl);
    this.dynamic_zone = document.getElementById('gui_dynamic');
    this.texture = null;
    this.out_texture = null;

    this.updated = false;
  }

  initStaticZone(regl) {
    this.createImageUploader(regl);
    this.createImageDownloader();
    this.createEffectSelector();
  }

  createSubmitButton(callback) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      return callback(event);
    });
    return button;
  }

  createSlider(min, max, callback) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.addEventListener('change', callback);
    return slider;
  }

  createCheckbox(callback) {
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

  createImageUploader(regl) {
    const div = document.createElement('div');
    const form = document.createElement('form');

    const file_input = document.createElement('input');
    file_input.id = 'file_input';
    file_input.type = 'file';
    file_input.accept = 'image/*';
    file_input.hidden = true;

    const button = this.createSubmitButton((_) => {
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

    this.static_zone.appendChild(div);
  }

  createImageDownloader() {
    const div = document.createElement('div');
    const button = document.createElement('button');
    button.innerHTML = 'Save...';
    button.addEventListener('click', () => {
      let link = document.createElement('a');
      link.download = 'output_image.png';
      link.href = document.getElementById('canvas').toDataURL('image/png');
      link.click();
    });
    div.appendChild(button);
    this.static_zone.appendChild(div);
  }

  createEffectSelector() {
    const div = document.createElement('div');
    const form = document.createElement('form');
    const selector = document.createElement('select');
    selector.setAttribute('id', 'fx_selector');
    for (const key in EffectsChain.fx_reg) {
      const opt = document.createElement('option');
      opt.setAttribute('value', key);
      opt.innerHTML = key;
      selector.appendChild(opt);
    }
    form.appendChild(selector);

    const button = this.createSubmitButton((_) => {
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
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.innerHTML = fx.constructor.name;
    div.appendChild(label);

    const callback = (event) => {
      event.preventDefault();

      const inputs = div.querySelectorAll('input');

      const params = {};
      inputs.forEach(input => {
        const [key, type] = input.id.split('#');

        if (type.startsWith('multi')) {
          let multi = tryGetValue(params, key, []);
          multi.push(input.value / 100.0);
        } else {
          params[key] = input.value;
        }
      });

      fx.setParams(params);
      this.updated = true;
    };

    const fx_params = Object.getOwnPropertyDescriptors(fx);
    for (const key in fx_params) {
      const param = fx_params[key];

      const param_div = document.createElement('div');
      const param_label = document.createElement('label');
      param_label.innerHTML = key;
      param_div.appendChild(param_label);
      // Array of numbers assumed to be values from 0 to 1
      if (Array.isArray(param.value) && typeof param.value[0] === 'number') {
        param.value.forEach((v, i) => {
          const slider = this.createSlider(0, 100, callback);
          slider.id = `${key}#multi${i}`
          slider.value = v * 100;
          param_div.appendChild(slider);
        });
      }

      // Single number assumed to be a flag
      else if (typeof param.value === 'number') {
        const checkbox = this.createCheckbox(callback);
        checkbox.id = `${key}#single`;
        param_div.appendChild(checkbox);
      }
      div.appendChild(param_div);
    }

    const delete_button = document.createElement('button');
    delete_button.innerHTML = 'X'
    delete_button.addEventListener('click', (event) => {
      this.fx_chain.removeEffect(fx);
      this.dynamic_zone.removeChild(div);
      this.updated = true;
    });
    div.appendChild(delete_button);

    this.dynamic_zone.appendChild(div);
  }

  update() {
    this.out_texture = this.fx_chain.apply(this.texture);
    this.updated = false;
  }
}

export { Gui };

