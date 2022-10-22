import { InputSchema } from '@common/interfaces/input-schema.interface';
import { emailSchema } from '@common/schema/email.schema';
import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

const schema = z.object({
  email: emailSchema,
});

@InputType()
export class UpdateEmailInput implements InputSchema {
  @Field()
  email!: string;

  getSchema() {
    return schema;
  }
}
