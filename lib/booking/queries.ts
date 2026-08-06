"use server";

import { requireUser } from "@/lib/auth/require-role";
import { listAvailableDates, listAvailableTimesForDate } from "@/lib/booking/availability";

export async function getAvailableDatesAction(): Promise<string[]> {
  await requireUser();
  return listAvailableDates();
}

export async function getAvailableTimesAction(
  date: string,
  guestsCount: number,
): Promise<string[]> {
  await requireUser();
  if (!date || guestsCount < 1) return [];
  return listAvailableTimesForDate(date, guestsCount);
}
