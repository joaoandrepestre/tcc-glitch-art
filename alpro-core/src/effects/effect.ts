import { DrawConfig } from "regl";
import Mapper from "./mapper";

type ReglPartialConfig = {
  uniforms: object,
  frag_partial: string,
  vert_partial: string,
}

export type ExportedEffect = {
  type: string;
  id: number;
  params: object;
};

type ParamMetadata = {
  name: string;
  type: string;
  value: any;
  options: string[] | undefined;
  labels: string[] | undefined;
};

export type EffectMetadata = {
  type: string;
  id: number;
  params: ParamMetadata[];
};

// Base Effect class defining the basic regl configurations for displaying an image
// and static helper functions for initializing the effects
export class Effect {
  // basic regl config for displaying an image, used by all effects
  static basicConfig: DrawConfig = {
    attributes: {
      position: [[-2, -4], [-4, -2], [-4, 2], [-3, 3], [-2, 4], [2, 4], [3, 3], [4, 2], [4, -2], [-2, -4]]
    },

    depth: { enable: false },

    uniforms: {
      texture: (_, props) => props.texture,
      time: ctx => ctx.time % 60,
      flipX: (_, props) => props.flipX,
    },

    count: 10,
    primitive: 'triangle fan',
    frag: undefined,
    vert: undefined,
  };

  type: string;
  id: number;
  config: ReglPartialConfig;
  disabled: boolean;

  constructor(id: number) {
    this.id = id;
    this.config = {
      uniforms: {},
      frag_partial: '',
      vert_partial: ''
    }
    this.disabled = false;

    this.config.uniforms[`disabled${this.id}`] = (_, props) => props[`disabled${this.id}`];
  }

  forEachParam(callback: (key: string, value: any) => void): void {
    let params = Object.getOwnPropertyDescriptors(this);
    for (const key in params) {
      if (key === 'config' || key === 'id' || key === 'type') continue;

      const param = params[key];

      callback(key, param.value);
    }
  }

  getShaderVarName(param_name: string): string {
    let split_name = param_name.split('_');
    let name = split_name.shift();
    name = split_name.reduce((accName, currName) => {
      accName += currName.charAt(0).toUpperCase() + currName.slice(1);
      return accName;
    }, name);
    name += this.id;
    return name;
  }

  getShaderVars(): string {
    let vars = '';
    this.forEachParam((key, value) => {
      let type;
      let name = this.getShaderVarName(key);

      if (typeof value === 'object'
        && !('selected' in value)) {
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

  getFragShaderVars(): string {
    return '';
  }

  getVertShaderVars(): string {
    return '';
  }

  getFragShaderMain(): string {
    return this.config.frag_partial;
  }

  getVertShaderMain(): string {
    return this.config.vert_partial;
  }

  setParams(params: object) {
    this.forEachParam((key, _) => {
      if (key in params) this[key] = params[key];
    });
  }

  getParams(): object {
    let params = {};
    params[`disabled${this.id}`] = this.disabled;
    return params;
  }

  export(): ExportedEffect {
    return {
      type: this.type,
      id: this.id,
      params: this.exportParams(),
    };
  }

  exportParams(): object {
    let ret = {};
    this.forEachParam((key, value) => {
      ret[key] = value;
    });
    return ret;
  }

  getMetadata(): EffectMetadata {
    let params: ParamMetadata[] = [];
    this.forEachParam((key, value) => {
      let param: ParamMetadata = {
        name: undefined,
        type: undefined,
        value: undefined,
        options: undefined,
        labels: undefined,
      };
      param.name = key;
      let type = typeof value;
      if (type === 'object') {
        if ('selected' in value) {
          param.type = 'select';
          param.value = value['selected'];
          let mapper = <typeof Mapper>this.constructor;
          param.options = Object.values(mapper.options);
          param.labels = undefined;
        }
        else {
          param.type = 'multi';
          param.value = Object.values(value);
          param.options = undefined;
          param.labels = Object.keys(value);
        }
      } else {
        param.type = type;
        param.value = value;
        param.options = undefined;
        param.labels = undefined;
      }
      params.push(param);
    });
    return {
      type: this.type.toLowerCase(),
      id: this.id,
      params
    };
  }
}

export class FragEffect extends Effect {

  constructor(id: number) {
    super(id);
  }

  getFragShaderVars(): string {
    return this.getShaderVars();
  }

  getFragShaderMain(): string {
    let main = `if (!disabled${this.id}) {\n`;
    main += super.getFragShaderMain();
    main += '\ncolor = max(min(color, vec3(1)), vec3(0));\n}';
    return main;
  }
}

export class VertEffect extends Effect {
  constructor(id: number) {
    super(id);
  }

  getVertShaderVars(): string {
    return this.getShaderVars();
  }

  getVertShaderMain(): string {
    let main = `if (!disabled${this.id}) {\n`;
    main += super.getVertShaderMain();
    main += '\n}';
    return main;
  }
}