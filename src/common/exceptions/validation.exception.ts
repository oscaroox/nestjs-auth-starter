import { UserInputError } from 'apollo-server-express';
import { ZodError } from 'zod';

export class ValidationException extends UserInputError {
  constructor(zodError: ZodError) {
    super(zodError.message, {
      exceptions: {
        issues: zodError.issues,
      },
    });
  }
}
