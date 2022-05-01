import { EffectsChain } from './effects/effects_chain.js';

let updated = false;
let image = new Image();

let submit = document.getElementById("submit_image");
submit.addEventListener('click', handleSubmit);
document.getElementById("file_input").addEventListener('change', () => submit.click());

function handleSubmit(event) {
  updated = false;
  event.preventDefault();

  if (!file_input.value.length) return;

  let reader = new FileReader();

  reader.onload = loadImage;

  reader.readAsDataURL(file_input.files[0]);
}

function loadImage(event) {
  let str = event.target.result;
  let div = document.getElementById("src_image");
  image.src = str;
  updated = true;
  div.append(image);
}

window.onload = async () => {
  const regl = createREGL("#canvas");
  await EffectsChain.init(regl);

  const fx = new EffectsChain();
  //fx.addEffect('noise');
  fx.addEffect('filter');

  regl.frame(() => {
    if (updated) {
      //updated = false;
      fx.apply(regl, image);
    }
  });
};