import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';
import { LoginLocalInput, loginLocalSchema } from './login-local.input';

export const registerLocalSchema = loginLocalSchema.extend({
  name: z.string().min(1).max(100),
});

@InputType()
export class RegisterLocalInput extends LoginLocalInput {
  @Field()
  name!: string;

  public getSchema(): z.ZodSchema {
    return registerLocalSchema;
  }
}
