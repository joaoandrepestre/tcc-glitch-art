// Base Effect class defining the basic regl configurations for displaying an image
// and static helper functions for initializing the effects
class Effect {
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

  constructor(id) {
    this.id = id;
  }

  getParams() {
    return {};
  }
}

export { Effect };