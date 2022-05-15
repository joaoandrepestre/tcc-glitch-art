const wait = async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export { wait };