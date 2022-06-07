export const firstLetterUpperCase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatLabel = (string) => {
  return string
    .split('_')
    .map(s => firstLetterUpperCase(s))
    .reduce((acc, curr) => acc + " " + curr);
};

export const hash = (string) => {
  let hash = 0, i, chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};