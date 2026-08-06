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
