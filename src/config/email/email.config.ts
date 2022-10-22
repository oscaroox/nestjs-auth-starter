import { requiredInProd } from '@common/schema/required-in-prod.schema';
import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const emailConfig = registerAs('email', () => {
  const vars = z
    .object({
      MAILGUN_API_KEY: requiredInProd(z.string()),
      MAILGUN_DOMAIN: requiredInProd(z.string()),
    })
    .parse(process.env);

  return {
    fromMessage: 'noreply',
    mailgunAPIKey: vars.MAILGUN_API_KEY,
    mailgunDomain: vars.MAILGUN_DOMAIN,
  };
});

export type EmailConfig = ConfigType<typeof emailConfig>;
