// Base Effect class defining the basic regl configurations for displaying an image
// and static helper functions for initializing the effects
class Effect {

  // defines how to transform the regl command into a function 
  // of the form (texture) => texture
  static define_fx_function = (effect) => (texture) => effect(texture);

  // basic regl config for displaying an image, used by all effects
  static basicConfig = {
    attributes: {
      position: [[-2, -4], [-2, 4], [4, 0]]
    },

    depth: { enable: false },

    uniforms: {
      texture: (_, props) => props.texture,
    },

    count: 3
  };

  // gets the shader (vert or frag) glsl file for the given effect and returns the code as a string
  static getShader = async (effect, shader) => {
    let s = await fetch(`./effects/${effect}/${shader}.glsl`)
      .then(r => {
        if (!r.ok) {
          const err = new Error(`Failed to find ${effect} ${shader} shader. Falling back to identity ${shader} shader.`);
          throw err;
        }
        return r.text()
      })
      .catch(err => {
        console.log(err.message);
        return "";
      });

    if (s === "") s = await Effect.getShader('identity', shader);

    return s;
  };

  // gets both shader strings for a given effect
  static getShaders = async (effect) => {
    return {
      frag: await Effect.getShader(effect, 'frag'),
      vert: await Effect.getShader(effect, 'vert')
    };
  };

  // given a config and a regl instance, defines the regl command and returns 
  // a function of the form (texture, props) => texture
  static getEffect = (regl, config) => {
    const command = regl(config);
    return (texture, props = {}) => {
      command({ texture: texture, ...props });
      return regl.texture({
        width: texture.width,
        height: texture.height,
        copy: true,
      });
    };
  };

  // inits the static variables of the effect class
  // - gets the shader strings
  // - defines the config based on basic configs and extra configs from the effect
  // - defines the regl command
  // - defines the static function the effect will use to apply the regl command on any instance of the class
  static init_effect = async (effect, regl) => {
    const shaders = await Effect.getShaders(effect.name);
    const config = { ...Effect.basicConfig, ...shaders, ...effect.extra_config };
    const command = Effect.getEffect(regl, config);
    effect.fx_function = effect.define_fx_function(command);
  };
}

export { Effect };