import { ValidationPipe } from '@common/pipes/validation.pipe';
import { Args } from '@nestjs/graphql';

export const ValidateArgs = (): ParameterDecorator =>
  Args('input', new ValidationPipe());
