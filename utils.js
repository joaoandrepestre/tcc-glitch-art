const tryGetValue = (obj, key, dflt) => {
  if (!(key in obj)) obj[key] = dflt;
  return obj[key];
};

const wait = async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export { tryGetValue, wait };