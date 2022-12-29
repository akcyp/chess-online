export const capitalize = (str: string) =>
  (str.at(0)?.toLocaleUpperCase() ?? '') + str.substring(1).toLocaleLowerCase();
