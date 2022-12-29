import 'reflect-metadata';
import { Equals, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GamePlayAction {
  @Expose()
  @Equals('play')
  type!: 'play';

  @Expose()
  @IsEnum(['white', 'black', 'exit'])
  color!: 'white' | 'black' | 'exit';

  static validate = createDTOValidator(this);
}
