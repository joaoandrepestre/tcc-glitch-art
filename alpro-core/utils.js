const wait = async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

exports.wait = wait;