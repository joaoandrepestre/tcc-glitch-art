export const firstLetterUpperCase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const formatLabel = (string) => {
  return string
    .split('_')
    .map(s => firstLetterUpperCase(s))
    .reduce((acc, curr) => acc + " " + curr);
}

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

export const round2Decimals = num => Math.round((num + Number.EPSILON) * 100) / 100;

export const setCookie = (name, value, days) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
};

export const getCookie = name => {
  let cname = `${name}=`;
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
};