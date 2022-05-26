export const wait = async (delay: number): Promise<any> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};