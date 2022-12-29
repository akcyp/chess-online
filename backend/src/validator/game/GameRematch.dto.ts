import 'reflect-metadata';
import { Equals } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GameRematchAction {
  @Expose()
  @Equals('rematch')
  type!: 'rematch';

  static validate = createDTOValidator(this);
}
