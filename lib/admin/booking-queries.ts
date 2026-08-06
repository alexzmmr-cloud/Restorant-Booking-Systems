import type { BookingStatus, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseDateOnlyKey } from "@/lib/booking/rules";

export type AdminBookingFilters = {
  status?: BookingStatus;
  date?: string; // "YYYY-MM-DD"
};

export async function listBookingsForAdmin(filters: AdminBookingFilters) {
  const where: Prisma.BookingWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.date) {
    where.date = parseDateOnlyKey(filters.date);
  }

  return prisma.booking.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, table: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
}
