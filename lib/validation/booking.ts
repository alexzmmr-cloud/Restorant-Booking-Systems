import { z } from "zod";

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export const createBookingSchema = z.object({
  date: z.string().regex(DATE_KEY_REGEX, "Некорректная дата"),
  time: z.string().regex(TIME_REGEX, "Некорректное время"),
  guestsCount: z.coerce.number().int().min(1, "Минимум 1 гость").max(8, "Максимум 8 гостей — вместимость самого большого стола"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
