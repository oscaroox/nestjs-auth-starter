import { z } from 'zod';

export const emailSchema = z.string().min(3).max(250).email();
