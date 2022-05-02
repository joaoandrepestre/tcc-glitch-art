const tryGetValue = (obj, key, dflt) => {
  if (!(key in obj)) obj[key] = dflt;
  return obj[key];
}

export { tryGetValue };