import { Core } from './core/core.js';
import { Gui } from './gui/gui.js';

window.onload = async () => {
  const canvas = document.getElementById('canvas');

  const core = new Core(canvas);
  const gui = new Gui(core);

  gui.update();
};