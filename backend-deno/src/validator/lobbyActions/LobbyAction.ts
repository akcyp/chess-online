import 'reflect-metadata';
import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class LobbyAction {
  @IsEnum(['createGame'])
  @Expose()
  type!: 'createGame';
  static validate = createDTOValidator(this, {
    parseStringToJSON: true,
  });
}
