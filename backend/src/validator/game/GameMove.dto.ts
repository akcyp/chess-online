import 'reflect-metadata';
import { Equals, IsEnum, IsOptional, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

import { createDTOValidator } from '../../utils/createDTOValidator.ts';

export class GameMoveAction {
  @Expose()
  @Equals('move')
  type!: 'move';

  @Expose()
  @Matches(/^[abcdefgh][12345678]$/)
  from!: string;

  @Expose()
  @Matches(/^[abcdefgh][12345678]$/)
  to!: string;

  @Expose()
  @IsOptional()
  @IsEnum(['q', 'n', 'b', 'p'])
  promotion?: 'q' | 'n' | 'b' | 'r';

  static validate = createDTOValidator(this);
}
