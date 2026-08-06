export const AVAILABILITY_DAYS_AHEAD = 14;
export const SLOT_STEP_MINUTES = 90;
export const OPENING_HOUR = 12;
export const OPENING_MINUTE = 0;
export const CLOSING_HOUR = 21;
export const CLOSING_MINUTE = 0;
export const CANCELLATION_DEADLINE_HOURS = 3;

/**
 * "Дата" в этом модуле — UTC-полночь конкретного календарного дня (год/месяц/день),
 * а не момент локального времени. Это единственный безопасный способ работать с
 * Prisma-полем `@db.Date`: локальная полночь при сериализации в ISO может съехать
 * на соседний день из-за смещения таймзоны (например UTC+3 → 21:00 предыдущих суток).
 * Компоненты год/месяц/день читаются через getUTC*, не через локальные геттеры.
 */

/** Понедельник = 1 в getUTCDay(); ресторан закрыт по понедельникам. */
const CLOSED_WEEKDAY = 1;

export function isRestaurantOpenOnDate(date: Date): boolean {
  return date.getUTCDay() !== CLOSED_WEEKDAY;
}

/** Список времён слотов в формате "HH:MM", от открытия до закрытия с шагом SLOT_STEP_MINUTES. */
export function generateDaySlotTimes(): string[] {
  const times: string[] = [];
  let totalMinutes = OPENING_HOUR * 60 + OPENING_MINUTE;
  const closingTotalMinutes = CLOSING_HOUR * 60 + CLOSING_MINUTE;

  while (totalMinutes <= closingTotalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    times.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    totalMinutes += SLOT_STEP_MINUTES;
  }

  return times;
}

function toUtcDateOnly(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

/** UTC-даты (полночь) на ближайшие AVAILABILITY_DAYS_AHEAD календарных дней начиная с сегодня (по локальному "сегодня" вызывающей стороны), только открытые дни недели. */
export function generateAvailableDates(now: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const startOfToday = toUtcDateOnly(now.getFullYear(), now.getMonth(), now.getDate());

  for (let offset = 0; offset < AVAILABILITY_DAYS_AHEAD; offset++) {
    const candidate = new Date(startOfToday);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    if (isRestaurantOpenOnDate(candidate)) {
      dates.push(candidate);
    }
  }

  return dates;
}

/** Локальный момент времени начала слота — для сравнения с реальным "сейчас". */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export function isSlotInPast(date: Date, time: string, now: Date = new Date()): boolean {
  return combineDateAndTime(date, time).getTime() <= now.getTime();
}

export function isCancellationAllowed(
  date: Date,
  time: string,
  now: Date = new Date(),
): boolean {
  const slotStart = combineDateAndTime(date, time);
  const deadline = new Date(slotStart.getTime() - CANCELLATION_DEADLINE_HOURS * 60 * 60 * 1000);
  return now.getTime() <= deadline.getTime();
}

export function toDateOnlyKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOnlyKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return toUtcDateOnly(year, month - 1, day);
}
