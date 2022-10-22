import { ApolloError } from 'apollo-server-express';

export class HttpException extends ApolloError {
  constructor(
    message: string,
    code: string,
    extensions: Record<string, unknown> = {},
  ) {
    super(message, code, { ...extensions });
  }
}
