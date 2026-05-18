import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(3),
  language: z.string().min(1),
});

export const updateSessionSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  language: z.string().min(1).max(50).optional(),
  notes: z.string().max(2000).nullable().optional(),
  endTime: z.coerce.date().optional(),
});
