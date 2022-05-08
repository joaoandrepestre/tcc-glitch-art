import { EffectsChain } from './effects/effects_chain.js';
import { Gui } from './gui/gui.js';

window.onload = async () => {
  const gl = document.getElementById('canvas').getContext('webgl', { preserveDrawingBuffer: true });
  const regl = createREGL(gl);

  const fx = new EffectsChain(regl);
  const gui = new Gui(regl, fx);

  let i = 0;
  regl.frame(() => {
    i = (i + 1) % 3;
    if (i) return;
    gui.update(regl);
  });
};