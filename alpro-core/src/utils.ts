export const wait = async (delay: number): Promise<any> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;