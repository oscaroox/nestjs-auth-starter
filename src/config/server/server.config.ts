import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { numberSchema } from '@common/schema/number.schema';

export const serverConfig = registerAs('server', () => {
  const vars = z
    .object({
      NODE_ENV: z.enum(['development', 'test', 'production']),
      LOG_LEVEL: z
        .enum(['warn', 'debug', 'info', 'error'])
        .default('info')
        .optional(),
      APP_URL: z.string().url(),
      PORT: numberSchema,
    })
    .parse(process.env);

  return {
    env: vars.NODE_ENV,
    isProd: vars.NODE_ENV === 'production',
    isTest: vars.NODE_ENV === 'test',
    isDev: vars.NODE_ENV === 'development',
    port: vars.PORT,

    appUrl: vars.APP_URL,
    appApiURL: `${vars.APP_URL}/_api`,

    logLevel: vars.LOG_LEVEL,
  };
});

export type ServerConfig = ConfigType<typeof serverConfig>;
