import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export type BasicCreateDTOValidatorOptions = {
  parseStringToJSON: boolean;
  excludeExtraneousValues: boolean;
};

export type CreateDTOValidatorOptions<I> = BasicCreateDTOValidatorOptions & {
  before: (
    plain: unknown,
    options: BasicCreateDTOValidatorOptions,
  ) => Promise<DTOValidatorResult<I | undefined>>;
  after: (
    plain: unknown,
    result: DTOValidatorResult<I>,
    options: BasicCreateDTOValidatorOptions,
  ) => Promise<DTOValidatorResult<I>>;
};

export type DTOValidatorResult<I> = {
  validationResult: boolean;
  validationErrors: ValidationError[];
  instance: I;
};

export const createDTOValidator = <
  // deno-lint-ignore no-explicit-any
  T extends { new (...args: any[]): any },
  I = InstanceType<T>,
>(
  DTO: T,
  defaultOpts: Partial<CreateDTOValidatorOptions<I>> = {},
) => {
  const defaultOptions: CreateDTOValidatorOptions<I> = {
    parseStringToJSON: false,
    excludeExtraneousValues: true,
    // deno-lint-ignore require-await
    before: async () => ({
      validationResult: true,
      validationErrors: [],
      instance: undefined,
    }),
    // deno-lint-ignore require-await
    after: async (_, r) => r,
    ...defaultOpts,
  };
  return async (
    val: unknown,
    opts: Partial<CreateDTOValidatorOptions<I>> = {},
  ): Promise<DTOValidatorResult<I | undefined>> => {
    const options: CreateDTOValidatorOptions<I> = {
      ...defaultOptions,
      ...opts,
    };

    const { before, after, ...restOptions } = options;

    const preValidationResult = await before(val, restOptions);
    if (preValidationResult.validationResult === false) {
      return preValidationResult;
    }

    if (options.parseStringToJSON && typeof val === 'string') {
      try {
        val = JSON.parse(val);
      } catch (_) {
        return {
          validationResult: false,
          validationErrors: [{
            property: '$',
            toString: () => 'Not a valid JSON',
          }],
          instance: undefined,
        };
      }
    }

    if (
      typeof val !== 'object' || Array.isArray(val) || val === null ||
      val?.constructor !== Object
    ) {
      return {
        validationResult: false,
        validationErrors: [{
          property: '$',
          toString: () => 'Not an object',
        }],
        instance: undefined,
      };
    }
    const instance: InstanceType<T> = plainToInstance(DTO, val, {
      excludeExtraneousValues: options.excludeExtraneousValues,
    });
    const validationErrors = await validate(instance);
    const validationResult = validationErrors.length === 0;
    const result = {
      validationResult,
      validationErrors,
      instance,
    };
    return await after(val, result, restOptions);
  };
};
