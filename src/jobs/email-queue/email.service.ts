import { JWTGenericPayload } from '@common/interfaces/jwt-payload.interface';
import { ConfigService } from '@config/config.service';
import { User } from '@database/entities';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  createVerifyEmailJWT(user: User) {
    const payload: JWTGenericPayload = {
      uid: user.id,
      type: 'verify-email',
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.jwt.generalExpiresIn,
    });
  }

  createResetPasswordJWT(user: User) {
    const payload: JWTGenericPayload = {
      uid: user.id,
      type: 'reset-password',
    };
    return this.jwtService.signAsync(payload, {
      secret: user.password,
      expiresIn: this.configService.jwt.generalExpiresIn,
    });
  }
}
