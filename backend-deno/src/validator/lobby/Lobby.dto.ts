import 'reflect-metadata';
import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class LobbyAction {
  @Expose()
  @IsEnum(['createGame'])
  type!: 'createGame';

  static validate = createDTOValidator(this);
}
