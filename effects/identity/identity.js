import { basicConfig, setShaders, getEffect } from "../effect_basics.js";

const getIdentityEffect = async (regl) => {

  let config = { ...basicConfig };
  await setShaders(config);

  const effect = getEffect(regl, config);
  return (image) => effect(image);
};

export { getIdentityEffect };