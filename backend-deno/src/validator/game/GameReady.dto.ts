import 'reflect-metadata';
import { Equals, IsBoolean } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GameReadyAction {
  @Expose()
  @Equals('ready')
  type!: 'ready';

  @Expose()
  @IsBoolean()
  ready!: boolean;

  static validate = createDTOValidator(this);
}
