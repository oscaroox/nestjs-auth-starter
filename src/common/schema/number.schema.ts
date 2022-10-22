import { z } from 'zod';

export const numberSchema = z.preprocess(
  (a) => parseInt(a as string, 10),
  z.number().positive(),
);
