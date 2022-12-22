import { adjectives, nouns } from 'unique-username-generator';
import { capitalize } from './captialize.ts';
import { getRandomInt } from './random.ts';

const dicts = {
  adj: adjectives.filter((word) => word.length <= 10),
  noun: nouns.filter((word) => word.length <= 10),
};

export const generateUsername = () => {
  const adj = dicts.adj.at(getRandomInt(0, dicts.adj.length - 1))!;
  const noun = dicts.noun.at(getRandomInt(0, dicts.noun.length - 1))!;
  const tag = getRandomInt(0, 999).toString();
  return `${capitalize(adj)}${capitalize(noun)}#${tag.padStart(4, '0')}`;
};
