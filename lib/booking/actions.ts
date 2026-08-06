"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-role";
import { createBookingSchema } from "@/lib/validation/booking";
import { findAvailableTable } from "@/lib/booking/availability";
import {
  isCancellationAllowed,
  isSlotInPast,
  parseDateOnlyKey,
  toDateOnlyKey,
} from "@/lib/booking/rules";
import {
  formatBookingCancelledByGuestMessage,
  formatBookingCreatedMessage,
} from "@/lib/booking/notifications";

export type BookingActionResult =
  | { success: true }
  | { success: false; error: string };

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export async function createBookingAction(input: unknown): Promise<BookingActionResult> {
  const user = await requireUser();

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { date, time, guestsCount } = parsed.data;
  const targetDate = parseDateOnlyKey(date);

  if (isSlotInPast(targetDate, time)) {
    return { success: false, error: "Нельзя забронировать прошедшее время" };
  }

  const table = await findAvailableTable(date, time, guestsCount);
  if (!table) {
    return { success: false, error: "На выбранное время нет свободного стола" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          tableId: table.id,
          date: targetDate,
          time,
          guestsCount,
          status: "pending",
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          bookingId: booking.id,
          message: formatBookingCreatedMessage(date, time, table.name),
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: "Это время уже занято — выберите другой вариант",
      };
    }
    throw error;
  }

  return { success: true };
}

export async function cancelBookingAction(bookingId: string): Promise<BookingActionResult> {
  const user = await requireUser();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) {
    return { success: false, error: "Бронирование не найдено" };
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { success: false, error: "Это бронирование нельзя отменить" };
  }

  if (!isCancellationAllowed(booking.date, booking.time)) {
    return {
      success: false,
      error: "Отменить бронирование можно не позднее чем за 3 часа до начала",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        bookingId: booking.id,
        message: formatBookingCancelledByGuestMessage(toDateOnlyKey(booking.date), booking.time),
      },
    });
  });

  return { success: true };
}
