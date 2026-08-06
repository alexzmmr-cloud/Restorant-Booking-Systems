import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "super_admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}
