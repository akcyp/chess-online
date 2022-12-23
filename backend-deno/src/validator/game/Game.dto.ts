import 'reflect-metadata';
import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

const actions = [
  'play',
  'ready',
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

  static validate = createDTOValidator(this);
}
