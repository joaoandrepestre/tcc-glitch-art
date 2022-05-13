// Base Effect class defining the basic regl configurations for displaying an image
// and static helper functions for initializing the effects
class Effect {
  // basic regl config for displaying an image, used by all effects
  static basicConfig = {
    attributes: {
      position: [[-2, -4], [-4, -2], [-4, 2], [-3, 3], [-2, 4], [2, 4], [3, 3], [4, 2], [4, -2], [-2, -4]]
    },

    depth: { enable: false },

    uniforms: {
      texture: (_, props) => props.texture,
      time: ctx => ctx.time % 60,
    },

    count: 10,
    primitive: 'triangle fan'
  };

  constructor(id) {
    this.id = id;
    this.config = {
      uniforms: {},
      frag_partial: '',
      vert_partial: ''
    }
    this.disabled = false;

    this.config.uniforms[`disabled${this.id}`] = (_, props) => props[`disabled${this.id}`];
  }

  forEachParam(callback) {
    let params = Object.getOwnPropertyDescriptors(this);
    for (const key in params) {
      if (key === 'config' || key === 'id') continue;

      const param = params[key];

      callback(key, param.value);
    }
  }

  getShaderVarName(param_name) {
    let split_name = param_name.split('_');
    let name = split_name.shift();
    name = split_name.reduce((accName, currName) => {
      accName += currName.charAt(0).toUpperCase() + currName.slice(1);
      return accName;
    }, name);
    name += this.id;
    return name;
  }

  getShaderVars() {
    let vars = '';
    this.forEachParam((key, value) => {
      let type;
      let name = this.getShaderVarName(key);

      if (typeof value === 'object'
        && !('options' in value)) {
        let size = Object.values(value).length;
        type = `vec${size}`;
      } else if (typeof value === 'boolean') {
        type = 'bool';
      } else {
        type = 'float';
      }

      vars += `uniform ${type} ${name};\n`;
    });

    return vars;
  }

  getFragShaderVars() {
    return '';
  }

  getVertShaderVars() {
    return '';
  }

  getFragShaderMain() {
    return this.config.frag_partial;
  }

  getVertShaderMain() {
    return this.config.vert_partial;
  }

  setParams(params) {
    if ('disabled' in params) this.disabled = params['disabled'] === 'false' ? false : true;
  }

  getParams() {
    let params = {};
    params[`disabled${this.id}`] = this.disabled;
    return params;
  }

  export() {
    return {
      type: this.constructor.name.toLowerCase(),
      id: this.id,
      params: this.exportParams(),
    };
  }

  exportParams() {
    let ret = {};
    this.forEachParam((key, value) => {
      ret[key] = value;
    });
    return ret;
  }

  getMetadata() {
    let params = [];
    this.forEachParam((key, value) => {
      let type = typeof value;
      let labels = [];
      let val = null;
      if (type === 'object') {
        if ('options' in value) {
          type = 'select';
          val = Object.values(value['options']);
          val.push(value['selected'])
        }
        else {
          type = 'multi';
          val = Object.values(value);
          labels = Object.keys(value);
        }
      } else {
        val = value;
      }
      params.push({
        name: key,
        type,
        value: val,
        labels
      });
    });
    return {
      type: this.constructor.name.toLowerCase(),
      id: this.id,
      params
    };
  }
}

class FragEffect extends Effect {

  constructor(id) {
    super(id);
  }

  getFragShaderVars() {
    return this.getShaderVars();
  }

  getFragShaderMain() {
    let main = `if (!disabled${this.id}) {\n`;
    main += super.getFragShaderMain();
    main += '\ncolor = max(min(color, vec3(1)), vec3(0));\n}';
    return main;
  }
}

class VertEffect extends Effect {
  constructor(id) {
    super(id);
  }

  getVertShaderVars() {
    return this.getShaderVars();
  }

  getVertShaderMain() {
    let main = `if (!disabled${this.id}) {\n`;
    main += super.getVertShaderMain();
    main += '\n}';
    return main;
  }
}

export { Effect, FragEffect, VertEffect };