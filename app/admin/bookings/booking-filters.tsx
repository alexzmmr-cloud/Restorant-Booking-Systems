"use client";

import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed", "no_show"] as const;

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
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        Статус
        <select
          value={currentStatus ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="">Все</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Дата
        <input
          type="date"
          value={currentDate ?? ""}
          onChange={(e) => updateParams({ date: e.target.value })}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>
      {(currentStatus || currentDate) && (
        <button
          type="button"
          onClick={() => router.push("/admin/bookings")}
          className="text-sm underline"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
