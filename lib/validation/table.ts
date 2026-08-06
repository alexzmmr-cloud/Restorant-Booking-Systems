import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().trim().min(1, "Название обязательно").max(50),
  capacity: z.coerce.number().int().min(1, "Минимум 1 гость").max(8, "Максимум 8 гостей за столом"),
});

export const updateTableSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Название обязательно").max(50),
  capacity: z.coerce.number().int().min(1, "Минимум 1 гость").max(8, "Максимум 8 гостей за столом"),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
