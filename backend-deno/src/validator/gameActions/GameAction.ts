import 'reflect-metadata';
import { IsEnum } from 'class-validator';
import { Expose, instanceToPlain } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

const actions = [
  'play',
  'exit',
  'move',
  'offerdraw',
  'resign',
  'rematch',
] as const;

type Action = (typeof actions)[number];

export class GameAction {
  @IsEnum(actions)
  @Expose()
  type!: Action;
  static validate = createDTOValidator(this, {
    parseStringToJSON: true,
  });
  serialize() {
    return instanceToPlain(this);
  }
}
