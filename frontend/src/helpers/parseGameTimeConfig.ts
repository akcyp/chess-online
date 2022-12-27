export const parseGameTimeConfig = (time: { minutes: number; increment: number }) => {
  return time.increment === 0 ? `${time.minutes}m` : `${time.minutes}m + ${time.increment}s`;
};
