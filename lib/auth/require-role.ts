import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";

export class UnauthorizedError extends Error {
  constructor() {
    super("Требуется вход в систему");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Недостаточно прав для этого действия");
    this.name = "ForbiddenError";
  }
}

/** Для server actions — при отсутствии сессии/прав бросает исключение, которое ловит вызывающий action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(
  allowedRoles: Array<CurrentUser["role"]>,
): Promise<CurrentUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) throw new ForbiddenError();
  return user;
}

/** Для Server Components (страниц) — при отсутствии сессии/прав делает редирект вместо падения с 500. */
export async function requireUserOrRedirect(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRoleOrRedirect(
  allowedRoles: Array<CurrentUser["role"]>,
): Promise<CurrentUser> {
  const user = await requireUserOrRedirect();
  if (!allowedRoles.includes(user.role)) redirect("/");
  return user;
}
