export const parseTimerString = (milis: number, extended: boolean, allowNegative = false) => {
  const addZero = (val: number, d = 2) => val.toString().padStart(d, '0');
  const ms = allowNegative ? Math.abs(milis) : Math.max(milis, 0);
  const sign = allowNegative && milis < 0 ? '-' : '';
  const minutes = Math.floor(ms / 1e3 / 60);
  const seconds = Math.floor((ms / 1e3) % 60);
  const miliseconds = ms % 1e3;
  return extended
    ? `${sign}${addZero(minutes)}:${addZero(seconds)}.${addZero(Math.floor(miliseconds / 100), 1)}`
    : `${sign}${addZero(minutes)}:${addZero(seconds)}`;
};
