import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';
import { numberSchema } from '@common/schema/number.schema';

export const databaseConfig = registerAs('database', () => {
  const vars = z
    .object({
      DATABASE_HOST: z.string(),
      DATABASE_PORT: numberSchema,
      DATABASE_USER: z.string(),
      DATABASE_PASSWORD: z.string(),
      DATABASE_NAME: z.string(),
    })
    .parse(process.env);

  return {
    host: vars.DATABASE_HOST,
    port: vars.DATABASE_PORT,
    user: vars.DATABASE_USER,
    password: vars.DATABASE_PASSWORD,
    dbName: vars.DATABASE_NAME,
  };
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
