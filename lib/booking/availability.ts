import { prisma } from "@/lib/prisma";
import {
  generateAvailableDates,
  generateDaySlotTimes,
  isSlotInPast,
  parseDateOnlyKey,
  toDateOnlyKey,
} from "@/lib/booking/rules";

export type AvailableSlot = {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
};

const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

/** Доступные даты на ближайшие 14 открытых дней, без вычисления слотов внутри дня. */
export function listAvailableDates(now: Date = new Date()): string[] {
  return generateAvailableDates(now).map(toDateOnlyKey);
}

/**
 * Доступные времена для конкретной даты и количества гостей: без прошедшего времени,
 * без слотов без подходящего свободного стола по вместимости.
 */
export async function listAvailableTimesForDate(
  dateKey: string,
  guestsCount: number,
  now: Date = new Date(),
): Promise<string[]> {
  const availableDates = generateAvailableDates(now);
  const targetDate = availableDates.find((date) => toDateOnlyKey(date) === dateKey);
  if (!targetDate) return [];

  const [tables, bookingsOnDate] = await Promise.all([
    prisma.table.findMany({
      where: { isActive: true, capacity: { gte: guestsCount } },
      orderBy: { capacity: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        date: targetDate,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { tableId: true, time: true },
    }),
  ]);

  if (tables.length === 0) return [];

  const bookedTableIdsByTime = new Map<string, Set<string>>();
  for (const booking of bookingsOnDate) {
    const set = bookedTableIdsByTime.get(booking.time) ?? new Set<string>();
    set.add(booking.tableId);
    bookedTableIdsByTime.set(booking.time, set);
  }

  return generateDaySlotTimes().filter((time) => {
    if (isSlotInPast(targetDate, time, now)) return false;

    const bookedTableIds = bookedTableIdsByTime.get(time) ?? new Set<string>();
    return tables.some((table) => !bookedTableIds.has(table.id));
  });
}

/** Подбор минимально подходящего по вместимости свободного стола на дату+время. Null, если такого нет. */
export async function findAvailableTable(
  dateKey: string,
  time: string,
  guestsCount: number,
): Promise<{ id: string; name: string; capacity: number } | null> {
  const targetDate = parseDateOnlyKey(dateKey);

  const [tables, bookingsAtSlot] = await Promise.all([
    prisma.table.findMany({
      where: { isActive: true, capacity: { gte: guestsCount } },
      orderBy: { capacity: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        date: targetDate,
        time,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { tableId: true },
    }),
  ]);

  const bookedTableIds = new Set(bookingsAtSlot.map((b) => b.tableId));
  const table = tables.find((t) => !bookedTableIds.has(t.id));

  return table ?? null;
}
