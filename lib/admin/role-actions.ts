"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";

export type RoleActionResult =
  | { success: true }
  | { success: false; error: string };

/** user -> admin или admin -> user. super_admin недоступен как цель ни в одну сторону. */
export async function changeUserRoleAction(
  targetUserId: string,
  newRole: "user" | "admin",
): Promise<RoleActionResult> {
  const actor = await requireRole(["super_admin"]);

  if (targetUserId === actor.id) {
    return { success: false, error: "Нельзя изменить свою собственную роль" };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return { success: false, error: "Пользователь не найден" };
  }

  if (targetUser.role === "super_admin") {
    return { success: false, error: "Роль super_admin нельзя изменить через интерфейс" };
  }

  if (targetUser.role === newRole) {
    return { success: false, error: "У пользователя уже установлена эта роль" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: targetUserId }, data: { role: newRole } });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.role_changed",
        targetType: "User",
        targetId: targetUserId,
        metadata: { from: targetUser.role, to: newRole },
      },
    });
  });

  return { success: true };
}
