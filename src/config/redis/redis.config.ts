import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { numberSchema } from '@common/schema/number.schema';

export const redisConfig = registerAs('redis', () => {
  const vars = z
    .object({
      REDIS_HOST: z.string(),
      REDIS_PORT: numberSchema,
    })
    .parse(process.env);

  return {
    host: vars.REDIS_HOST,
    port: vars.REDIS_PORT,
  };
});

export type RedisConfig = ConfigType<typeof redisConfig>;
