"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getNextAvailabilityForTableAction } from "@/lib/booking/queries";
import { TableDiagram } from "./table-diagram";

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
}

export function TableCard({
  table,
}: {
  table: { id: string; name: string; capacity: number };
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<{ date: string; times: string[] } | null | undefined>(
    undefined,
  );

  async function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (availability !== undefined) return;

    setIsLoading(true);
    try {
      const result = await getNextAvailabilityForTableAction(table.id);
      setAvailability(result);
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }

  function goToBooking(time?: string) {
    const params = new URLSearchParams({ guests: String(table.capacity) });
    if (availability?.date) params.set("date", availability.date);
    if (time) params.set("time", time);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <div
      className={[
        "flex flex-col items-center gap-2 rounded-card border bg-surface p-6 text-center shadow-[0_2px_12px_rgba(27,27,27,0.06)] transition-all duration-200",
        isOpen
          ? "border-accent shadow-[0_8px_24px_rgba(27,27,27,0.12)]"
          : "border-transparent hover:border-accent hover:shadow-[0_8px_24px_rgba(27,27,27,0.12)]",
      ].join(" ")}
    >
      <button type="button" onClick={handleToggle} className="flex flex-col items-center gap-2">
        <TableDiagram capacity={table.capacity} />
        <span className="font-display text-lg font-semibold text-primary">
          {table.capacity} {table.capacity === 1 ? "гость" : "гостей"}
        </span>
        <span className="text-xs text-text/60">{table.name}</span>
      </button>

      {isOpen && (
        <div className="mt-3 w-full border-t border-border pt-3 text-left">
          {isLoading ? (
            <p className="text-xs text-text/50">Проверяем доступность...</p>
          ) : availability === null ? (
            <p className="text-xs text-text/50">
              В ближайшие 14 дней нет свободных окон для этого стола.
            </p>
          ) : availability ? (
            <>
              <p className="mb-2 text-[11px] tracking-[0.06em] text-text/50 uppercase">
                Ближайшая доступность — {formatDateLabel(availability.date)}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {availability.times.slice(0, 4).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => goToBooking(time)}
                    className="rounded-control border border-border bg-background px-2 py-1.5 text-xs text-text transition-colors duration-200 hover:border-primary hover:text-primary"
                  >
                    {time}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToBooking()}
                  className="col-span-2 mt-1 rounded-control bg-primary px-2 py-1.5 text-xs font-semibold text-background transition-colors duration-200 hover:bg-primary-hover"
                >
                  Все даты и время →
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
