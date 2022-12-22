import 'reflect-metadata';
import { Equals } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GameResignAction {
  @Expose()
  @Equals('resign')
  type!: 'resign';

  static validate = createDTOValidator(this);
}
