export const firstLetterUpperCase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const formatLabel = (string) => {
  return string
    .split('_')
    .map(s => firstLetterUpperCase(s))
    .reduce((acc, curr) => acc + " " + curr);
}