export const parseGameTimeConfig = (time: number[]) => {
  return time[1] === 0 ? `${time[0]}m` : `${time[0]}m + ${time[1]}s`;
};
