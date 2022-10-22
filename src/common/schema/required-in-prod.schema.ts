import { z } from 'zod';

export const requiredInProd = (schema: z.ZodSchema) => {
  return schema.superRefine((val, ctx) => {
    if (process.env.NODE_ENV === 'production' && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'this field is required',
      });
    }
  });
};
