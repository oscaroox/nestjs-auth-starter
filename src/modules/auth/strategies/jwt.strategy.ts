import { JWTAuthPayload } from '@common/interfaces/jwt-payload.interface';
import { ConfigService } from '@config/config.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.authSecret,
    } as StrategyOptions);
  }

  async validate(payload: JWTAuthPayload) {
    const user = await this.authService.getUserWithRoles(payload.uid);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
