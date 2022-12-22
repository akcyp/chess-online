import 'reflect-metadata';
import { Equals } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GameOfferDrawAction {
  @Equals('offerdraw')
  @Expose()
  type!: 'offerdraw';

  static validate = createDTOValidator(this);
}
