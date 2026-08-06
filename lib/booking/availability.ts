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

/**
 * Даты из ближайших 14 открытых дней, на которые для заданного числа гостей есть
 * хотя бы один свободный слот — чтобы форма не заставляла гостя вслепую перебирать даты.
 */
export async function listDatesWithAvailability(
  guestsCount: number,
  now: Date = new Date(),
): Promise<string[]> {
  const dateKeys = listAvailableDates(now);
  const results = await Promise.all(
    dateKeys.map(async (dateKey) => {
      const times = await listAvailableTimesForDate(dateKey, guestsCount, now);
      return times.length > 0 ? dateKey : null;
    }),
  );
  return results.filter((dateKey): dateKey is string => dateKey !== null);
}

/**
 * Ближайшая дата и слоты времени, доступные для конкретного стола (не любого подходящего
 * по вместимости, а именно этого) — для витрины столов на лендинге.
 */
export async function findNextAvailabilityForTable(
  tableId: string,
  now: Date = new Date(),
): Promise<{ date: string; times: string[] } | null> {
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) return null;

  const dateKeys = listAvailableDates(now);

  for (const dateKey of dateKeys) {
    const targetDate = parseDateOnlyKey(dateKey);
    const bookingsOnDate = await prisma.booking.findMany({
      where: {
        tableId,
        date: targetDate,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { time: true },
    });
    const bookedTimes = new Set(bookingsOnDate.map((b) => b.time));

    const times = generateDaySlotTimes().filter(
      (time) => !isSlotInPast(targetDate, time, now) && !bookedTimes.has(time),
    );

    if (times.length > 0) {
      return { date: dateKey, times };
    }
  }

  return null;
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
