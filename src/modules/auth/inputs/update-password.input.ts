import { InputSchema } from '@common/interfaces/input-schema.interface';
import { passwordSchema } from '@common/schema/password.schema';
import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

const schema = z.object({
  password: passwordSchema,
});

@InputType()
export class UpdatePasswordInput implements InputSchema {
  @Field()
  password!: string;

  getSchema() {
    return schema;
  }
}
