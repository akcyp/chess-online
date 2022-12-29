import { parseJSON } from './parseJSON.ts';

import type { DTOValidatorResult } from './createDTOValidator.ts';

type DTO<I extends { type: string }> = {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): I;
  validate(
    val: unknown,
  ): Promise<DTOValidatorResult<I | undefined>>;
};

export const combineDTOValidators = <
  T extends DTO<{ type: string }>,
  M extends Record<K, DTO<{ type: K }>>,
  K extends string = InstanceType<T>['type'],
  R = {
    [L in K]: {
      type: L;
      instance: InstanceType<M[L]>;
    };
  }[K],
>(
  preDTO: T,
  map: M,
) => {
  return async (raw: unknown): Promise<R | Error> => {
    const data = parseJSON(raw?.toString() ?? '');
    if (data instanceof Error) {
      return new Error('Invalid data format', { cause: data });
    }
    const validationResult = await preDTO.validate(data);
    if (!validationResult.validationResult || !validationResult.instance) {
      return new Error('Invalid payload');
    }
    const type = validationResult.instance.type as K;
    if (type in map) {
      const validationRes = await map[type].validate(data);
      if (!validationRes.validationResult || !validationRes.instance) {
        return new Error('Invalid action payload');
      }
      return {
        type: type,
        instance: validationRes.instance,
      } as R;
    }
    throw new Error(`${validationResult.instance.type} not handled`);
  };
};
