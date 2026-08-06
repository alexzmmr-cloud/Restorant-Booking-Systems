"use server";

import type { BookingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { isAdminTransitionAllowed } from "@/lib/booking/state-machine";
import { toDateOnlyKey } from "@/lib/booking/rules";

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "ожидает подтверждения",
  confirmed: "подтверждено",
  cancelled: "отменено",
  completed: "завершено",
  no_show: "неявка",
};

function formatAdminStatusChangeMessage(date: string, time: string, newStatus: BookingStatus): string {
  return `Статус вашего бронирования на ${date} в ${time} изменён: ${STATUS_LABELS[newStatus]}.`;
}

async function transitionBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<AdminActionResult> {
  const actor = await requireRole(["admin", "super_admin"]);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return { success: false, error: "Бронирование не найдено" };
  }

  if (!isAdminTransitionAllowed(booking.status, newStatus)) {
    return {
      success: false,
      error: `Нельзя перевести бронирование из статуса «${booking.status}» в «${newStatus}»`,
    };
  }

  const wasStale = await prisma.$transaction(async (tx) => {
    // Условный update по снимку статуса — если его успел поменять параллельный запрос,
    // matchedCount будет 0, и вся транзакция откатывается без искажения AuditLog/Notification.
    const { count } = await tx.booking.updateMany({
      where: { id: bookingId, status: booking.status },
      data: { status: newStatus },
    });

    if (count === 0) return true;

    await tx.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        message: formatAdminStatusChangeMessage(
          toDateOnlyKey(booking.date),
          booking.time,
          newStatus,
        ),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: `booking.${newStatus}`,
        targetType: "Booking",
        targetId: booking.id,
        metadata: { from: booking.status, to: newStatus },
      },
    });

    return false;
  });

  if (wasStale) {
    return {
      success: false,
      error: "Статус бронирования уже был изменён другим действием — обновите страницу",
    };
  }

  return { success: true };
}

export async function confirmBookingAction(bookingId: string): Promise<AdminActionResult> {
  return transitionBookingStatus(bookingId, "confirmed");
}

export async function cancelBookingAsAdminAction(bookingId: string): Promise<AdminActionResult> {
  return transitionBookingStatus(bookingId, "cancelled");
}

export async function completeBookingAction(bookingId: string): Promise<AdminActionResult> {
  return transitionBookingStatus(bookingId, "completed");
}

export async function markNoShowAction(bookingId: string): Promise<AdminActionResult> {
  return transitionBookingStatus(bookingId, "no_show");
}
