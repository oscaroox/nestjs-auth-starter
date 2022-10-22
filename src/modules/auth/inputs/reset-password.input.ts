import { InputSchema } from '@common/interfaces/input-schema.interface';
import { passwordSchema } from '@common/schema/password.schema';
import { Field, InputType } from '@nestjs/graphql';
import { JWTResolver } from 'graphql-scalars';
import { z } from 'zod';

const schema = z.object({
  token: z.string(),
  password: passwordSchema,
});

@InputType()
export class ResetPasswordInput implements InputSchema {
  @Field(() => JWTResolver)
  token!: string;

  @Field()
  password!: string;

  getSchema() {
    return schema;
  }
}
