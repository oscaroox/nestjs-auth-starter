import { HttpException } from '@common/exceptions/http.exceptions';

export class UserExistsException extends HttpException {
  constructor() {
    super('user exists', 'USER_EXISTS');
  }
}
