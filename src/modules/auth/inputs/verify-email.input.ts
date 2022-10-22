import { InputSchema } from '@common/interfaces/input-schema.interface';
import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

const schema = z.object({
  // how big can the token realistically get?
  token: z.string().min(10).max(1000),
});

@InputType()
export class VerifyEmailInput implements InputSchema {
  @Field()
  token!: string;

  getSchema() {
    return schema;
  }
}
