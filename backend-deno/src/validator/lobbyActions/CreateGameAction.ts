import 'reflect-metadata';
import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { LobbyAction } from './LobbyAction.ts';
import { createDTOValidator } from '../../utils/createDTOValidator.ts';

const minutesSteps = [
  ...Array.from({ length: 7 }, (_, i) => 0.25 * (i + 1)),
  ...Array.from({ length: 19 }, (_, i) => i + 2),
  ...Array.from({ length: 5 }, (_, i) => 25 + i * 5),
  ...Array.from({ length: 9 }, (_, i) => 60 + i * 15),
];
const incrementSteps = [
  ...Array.from({ length: 21 }, (_, i) => i),
  ...Array.from({ length: 5 }, (_, i) => 25 + i * 5),
  ...Array.from({ length: 5 }, (_, i) => 60 + i * 30),
];

export class CreateGameAction {
  @IsEnum(['createGame'])
  @Expose()
  type!: 'createGame';

  @IsEnum(minutesSteps)
  @Expose()
  minutes!: number;

  @IsEnum(incrementSteps)
  @Expose()
  increment!: number;

  static validate = createDTOValidator(this, {
    parseStringToJSON: true,
    before: async (val, options) => {
      return await LobbyAction.validate(val, options);
    },
  });
}
