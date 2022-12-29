export const getRandomInt = (rawMin: number, rawMax: number) => {
  const min = Math.ceil(rawMin);
  const max = Math.floor(rawMax);
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomNumber = randomBuffer[0] / (0xffffffff + 1);
  return Math.floor(randomNumber * (max - min + 1)) + min;
};

const alphabet = '123456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
export const getRandomString = (length = 6) => {
  return Array.from({ length }, () => {
    return alphabet.charAt(getRandomInt(0, alphabet.length - 1));
  }).join('');
};

export const getUniqueString = (except: string[]): string => {
  while (true) {
    const id = getRandomString();
    if (!except.includes(id)) {
      return id;
    }
  }
};
