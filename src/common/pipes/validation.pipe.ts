import { ValidationException } from '@common/exceptions/validation.exception';
import { InputSchema } from '@common/interfaces/input-schema.interface';
import { Newable } from '@common/interfaces/newable.interface';
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Type,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.canValidateSchema(metadata.metatype)) {
      return value;
    }
    const Input = metadata.metatype as Newable<InputSchema>;
    const schemaInstance = new Input();
    const values = await schemaInstance
      .getSchema()
      .parseAsync(value)
      .catch((err) => {
        throw new ValidationException(err as ZodError);
      });
    return this.mapValuesToInstance(schemaInstance, values);
  }

  private canValidateSchema(metaType: Type<unknown>): boolean {
    return !!metaType?.prototype.getSchema;
  }

  mapValuesToInstance(
    instance: InputSchema,
    values: Record<string, unknown>,
  ): InputSchema {
    for (const key in values) {
      (instance as InputSchema & Record<string, unknown>)[key] = values[key];
    }
    return instance;
  }
}
