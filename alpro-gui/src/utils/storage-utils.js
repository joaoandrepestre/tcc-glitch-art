import LZString from "lz-string";

const compressContent = (content) => LZString.compress(JSON.stringify(content));

const decompressContent = (content) =>
  content === null ? {} :
    JSON.parse(LZString.decompress(content));


export const getLocalStorageIndex = (key) => {
  const str = localStorage.getItem(key);

  return decompressContent(str);
};

export const updateLocalStorageIndex = (key, indexer, value, indexSize) => {
  const str = localStorage.getItem(key);
  let index = decompressContent(str);

  const subKey = indexer(value);
  const obj = {
    timestamp: new Date(),
    value,
  };

  if (!(subKey in index) &&
    Object.keys(index).length >= indexSize) {
    let oldest = Object.entries(index)
      .reduce((old, curr) => {
        if (new Date(curr[1].timestamp).getTime() < new Date(old[1].timestamp).getTime()) return curr;
        return old;
      }, [subKey, obj])[0];
    delete index[oldest];
  }

  index[subKey] = obj;
  localStorage.setItem(key, compressContent(index));
  return subKey;
};

export const getValueFromLocalStorageIndex = (key, subKey) => {
  const str = localStorage.getItem(key);

  const index = decompressContent(str);
  return subKey in index ? index[subKey].value : null;
};

export const updateSessionStorageValue = (key, value) =>
  sessionStorage.setItem(key, compressContent(value));

export const getSessionStorageValue = (key) => {
  const str = sessionStorage.getItem(key);

  return decompressContent(str);
};