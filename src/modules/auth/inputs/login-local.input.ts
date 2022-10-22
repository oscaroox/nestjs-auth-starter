import { InputSchema } from '@common/interfaces/input-schema.interface';
import { emailSchema } from '@common/schema/email.schema';
import { passwordSchema } from '@common/schema/password.schema';
import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

export const loginLocalSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

@InputType()
export class LoginLocalInput implements InputSchema {
  @Field()
  email!: string;

  @Field()
  password!: string;

  public getSchema(): z.ZodSchema {
    return loginLocalSchema;
  }
}
