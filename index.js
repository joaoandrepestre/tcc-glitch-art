import { EffectsChain } from './effects/effects_chain.js';
import { Gui } from './gui/gui.js';

window.onload = async () => {
  const gl = document.getElementById('canvas').getContext('webgl', { preserveDrawingBuffer: true });
  const regl = createREGL(gl);
  await EffectsChain.init(regl);

  const fx = new EffectsChain();
  const gui = new Gui(regl, fx);

  regl.frame(() => {
    gui.update(regl);
  });
};