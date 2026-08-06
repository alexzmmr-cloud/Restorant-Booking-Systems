"use server";

import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

const BCRYPT_SALT_ROUNDS = 12;

export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };

export async function registerAction(input: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "Пользователь с таким email уже зарегистрирован" };
  }

  const passwordHash = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true },
  });

  await createSession(user.id);

  return { success: true };
}

export async function loginAction(input: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Неверный email или пароль" };
  }

  const passwordMatches = await bcryptjs.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { success: false, error: "Неверный email или пароль" };
  }

  await createSession(user.id);

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
