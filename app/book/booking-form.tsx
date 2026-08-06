"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableDatesAction, getAvailableTimesAction } from "@/lib/booking/queries";
import { createBookingAction } from "@/lib/booking/actions";

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short", timeZone: "UTC" });
}

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
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-card bg-surface p-10 shadow-[0_4px_28px_rgba(27,27,27,0.09)]">
        <span className="mb-3 block text-sm tracking-[0.12em] text-primary/70 uppercase">
          Бронирование
        </span>
        <h1 className="font-display text-4xl font-semibold text-primary">
          Забронировать стол
        </h1>
        <p className="mt-2 text-sm text-text/60">
          Выберите дату, число гостей — мы сами подберём подходящий стол
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text">Дата</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {formatDateLabel(date)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text">Гостей</span>
              <input
                type="number"
                min={1}
                max={6}
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
                required
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Время</span>
            {isLoadingTimes ? (
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-control bg-border/60"
                  />
                ))}
              </div>
            ) : times.length === 0 ? (
              <p className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text/60">
                На эту дату нет свободных мест для такого числа гостей
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={[
                      "rounded-control border px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      selectedTime === time
                        ? "border-accent bg-accent/40 text-primary"
                        : "border-border bg-background text-text hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-control border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedTime}
            className="rounded-control bg-primary px-4 py-3.5 text-sm font-bold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Бронируем..." : "Забронировать стол"}
          </button>
        </form>
      </div>
    </main>
  );
}
