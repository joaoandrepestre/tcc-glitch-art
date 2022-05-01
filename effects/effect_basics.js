const getEffect = (regl, config) => {
  const command = regl(config);
  return (image, props = {}) => {
    const texture = regl.texture({ data: image, flipY: true });
    return command({ texture: texture, ...props });
  };
};

const basicConfig = {
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

const getShader = (effect, shader) => fetch(`./effects/${effect}/${shader}.glsl`)
  .then(r => {
    if (!r.ok)
      return fetch(`./effects/identity/${shader}.glsl`)
    return r;
  })
  .then(r => r.text());

const setShaders = (config, effect = 'identity') => Promise.all([getShader(effect, 'frag'), getShader(effect, 'vert')])
  .then(shaders => {
    config["frag"] = shaders[0];
    config["vert"] = shaders[1];
  });

export { getEffect, basicConfig, setShaders };