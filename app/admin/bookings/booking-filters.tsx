"use client";

import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "pending", label: "Ожидает подтверждения" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "cancelled", label: "Отменено" },
  { value: "completed", label: "Завершено" },
  { value: "no_show", label: "Неявка" },
] as const;

export function BookingFilters({
  currentStatus,
  currentDate,
}: {
  currentStatus?: string;
  currentDate?: string;
}) {
  const router = useRouter();

  function updateParams(next: { status?: string; date?: string }) {
    const params = new URLSearchParams();
    const status = next.status !== undefined ? next.status : currentStatus;
    const date = next.date !== undefined ? next.date : currentDate;
    if (status) params.set("status", status);
    if (date) params.set("date", date);
    router.push(`/admin/bookings?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-card bg-surface p-4 shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
      <label className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-text">Статус</span>
        <select
          value={currentStatus ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-control border border-border bg-background px-3 py-1.5 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
        >
          <option value="">Все</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-text">Дата</span>
        <input
          type="date"
          value={currentDate ?? ""}
          onChange={(e) => updateParams({ date: e.target.value })}
          className="rounded-control border border-border bg-background px-3 py-1.5 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
        />
      </label>
      {(currentStatus || currentDate) && (
        <button
          type="button"
          onClick={() => router.push("/admin/bookings")}
          className="text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
