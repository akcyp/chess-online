export const getRandomInt = (rawMin: number, rawMax: number) => {
  const min = Math.ceil(rawMin);
  const max = Math.floor(rawMax);
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomNumber = randomBuffer[0] / (0xffffffff + 1);
  return Math.floor(randomNumber * (max - min + 1)) + min;
};
