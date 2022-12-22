import 'reflect-metadata';
import { Equals, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GamePlayAction {
  @Expose()
  @Equals('play')
  type!: 'play';

  @Expose()
  @IsEnum(['white', 'black'])
  color!: 'white' | 'black';

  static validate = createDTOValidator(this);
}
