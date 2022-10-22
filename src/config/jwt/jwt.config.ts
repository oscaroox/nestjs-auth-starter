import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const jwtConfig = registerAs('jwt', () => {
  const vars = z
    .object({
      JWT_AUTH_SECRET: z.string(),
      JWT_GENERAL_SECRET: z.string(),
      JWT_AUTH_EXPIRES_IN: z.string(),
      JWT_GENERAL_EXPIRED_IN: z.string().optional().default('10m'),
    })
    .parse(process.env);

  return {
    authSecret: vars.JWT_AUTH_SECRET,
    generalSecret: vars.JWT_GENERAL_SECRET,
    authExpiresIn: vars.JWT_AUTH_EXPIRES_IN,
    generalExpiresIn: vars.JWT_GENERAL_EXPIRED_IN,
  };
});

export type JWTConfig = ConfigType<typeof jwtConfig>;
