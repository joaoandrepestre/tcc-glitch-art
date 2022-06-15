export const updateSessionStorageValue = (key, value) =>
  sessionStorage.setItem(key, JSON.stringify(value));

export const getSessionStorageValue = (key) => {
  const str = sessionStorage.getItem(key);

  if (str === null) return null;

  return JSON.parse(str);
};