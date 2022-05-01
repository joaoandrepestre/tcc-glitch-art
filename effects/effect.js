class Effect {

  static define_fx_function = (effect) => (image) => effect(image);

  static basicConfig = {
    attributes: {
      position: [[-2, -4], [-2, 4], [4, 0]]
    },

    depth: { enable: false },

    uniforms: {
      texture: (_, props) => props.texture,
      aspectRatio: ctx => {
        const ar = ctx.drawingBufferWidth / ctx.drawingBufferHeight;
        return ar > 1 ? [ar, 1] : [1, 1 / ar];
      }
    },

    count: 3
  };

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

  static getShaders = async (effect = 'identity') => {
    return {
      frag: await Effect.getShader(effect, 'frag'),
      vert: await Effect.getShader(effect, 'vert')
    };
  };

  static getEffect = (regl, config) => {
    const command = regl(config);
    return (image, props = {}) => {
      const texture = regl.texture({ data: image, flipY: true });
      return command({ texture: texture, ...props });
    };
  };

  static init_effect = async (effect, regl) => {
    const shaders = await Effect.getShaders(effect.name);
    const config = { ...Effect.basicConfig, ...shaders, ...effect.extra_config };
    const command = Effect.getEffect(regl, config);
    effect.fx_function = effect.define_fx_function(command);
  };
}

export { Effect };