"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableDatesAction, getAvailableTimesAction } from "@/lib/booking/queries";
import { createBookingAction } from "@/lib/booking/actions";

export function BookingForm() {
  const router = useRouter();
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [times, setTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAvailableDatesAction().then((result) => {
      setDates(result);
      setSelectedDate(result[0] ?? "");
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setIsLoadingTimes(true);
    setSelectedTime("");
    getAvailableTimesAction(selectedDate, guestsCount)
      .then((result) => {
        setTimes(result);
        setSelectedTime(result[0] ?? "");
      })
      .finally(() => setIsLoadingTimes(false));
  }, [selectedDate, guestsCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError("Выберите дату и время");
      return;
    }

    setIsSubmitting(true);
    let result;
    try {
      result = await createBookingAction({
        date: selectedDate,
        time: selectedTime,
        guestsCount,
      });
    } catch {
      setIsSubmitting(false);
      setError("Сессия истекла — войдите заново");
      router.push("/login");
      return;
    }
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/bookings");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Забронировать стол</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Количество гостей</span>
          <input
            type="number"
            min={1}
            max={20}
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            className="rounded border border-neutral-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Дата</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          >
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Время</span>
          {isLoadingTimes ? (
            <p className="text-sm text-neutral-500">Загружаем доступное время...</p>
          ) : times.length === 0 ? (
            <p className="text-sm text-neutral-500">На эту дату нет свободных мест для такого числа гостей</p>
          ) : (
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2"
            >
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          )}
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !selectedTime}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-40"
        >
          {isSubmitting ? "Бронируем..." : "Забронировать"}
        </button>
      </form>
    </main>
  );
}
