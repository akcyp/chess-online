export const parseJSON = (raw: string): Error | unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch (err) {
    return new Error('Failed to parse JSON', { cause: err });
  }
};
