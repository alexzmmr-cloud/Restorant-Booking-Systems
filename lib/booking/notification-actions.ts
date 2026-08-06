"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-role";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const user = await requireUser();

  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== user.id) {
    return;
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}
