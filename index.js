import { EffectsChain } from './effects/effects_chain.js';
import { Gui } from './gui/gui.js';

window.onload = async () => {
  const regl = createREGL("#canvas");
  await EffectsChain.init(regl);

  const fx = new EffectsChain();
  const gui = new Gui(fx);

  regl.frame(() => {
    if (gui.updated) {
      fx.apply(regl, gui.src_image);
      gui.updated = false;
    }
  });
};