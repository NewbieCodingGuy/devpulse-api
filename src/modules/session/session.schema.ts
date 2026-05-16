import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(8),
  language: z.string().min(8),
});
