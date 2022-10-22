import { HttpException } from '@common/exceptions/http.exceptions';

export class InvalidCredentials extends HttpException {
  constructor() {
    super('invalid email or password', 'INVALID_CREDENTIALS');
  }
}
