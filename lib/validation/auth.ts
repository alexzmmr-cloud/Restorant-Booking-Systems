import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов").max(100),
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
