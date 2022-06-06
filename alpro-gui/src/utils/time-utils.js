export const wait = async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

const MAX_TRIES = 100;
export const waitForCondition = (condition, callback) =>
  new Promise((resolve, reject) => {
    (async () => {
      let tries = 0;
      let debounce = 100;
      while (!condition() && tries < MAX_TRIES) {
        await wait(debounce);
        tries++;
        debounce *= 1.5;
      }

      if (condition())
        resolve(callback());

      reject(null);
    }
    )();
  });