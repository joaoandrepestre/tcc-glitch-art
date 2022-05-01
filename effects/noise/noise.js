import { basicConfig, setShaders, getEffect } from "../effect_basics.js";

const getNoiseEffect = async (regl) => {

  const uniforms = {
    ...basicConfig.uniforms,
    redFactor: (_, props) => props.redFactor,
    greenFactor: (_, props) => props.greenFactor,
    blueFactor: (_, props) => props.blueFactor,
    time: ctx => ctx.time
  };

  let config = { ...basicConfig, uniforms: uniforms };
  await setShaders(config, 'noise');

  const effect = getEffect(regl, config);
  return (image, redFactor, greenFactor, blueFactor) => effect(image, { redFactor, greenFactor, blueFactor });
};

export { getNoiseEffect };