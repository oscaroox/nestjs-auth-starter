import { HttpException } from '@common/exceptions/http.exceptions';

export class ExpiredTokenException extends HttpException {
  constructor() {
    super('token is expired or invalid', 'EXPIRED_TOKEN');
  }
}
