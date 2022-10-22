import { z } from 'zod';

export interface InputSchema {
  getSchema(): z.ZodSchema;
}
