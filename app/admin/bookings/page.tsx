import type { BookingStatus } from "@/lib/generated/prisma/client";
import { listBookingsForAdmin } from "@/lib/admin/booking-queries";
import { toDateOnlyKey } from "@/lib/booking/rules";
import { StatusBadge } from "../../status-badge";
import { BookingActions } from "./booking-actions";
import { BookingFilters } from "./booking-filters";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed", "no_show"];

export default async function AdminBookingsPage({
  searchParams,
}: PageProps<"/admin/bookings">) {
  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const dateParam = typeof params.date === "string" ? params.date : undefined;

  const status = VALID_STATUSES.includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;

  const bookings = await listBookingsForAdmin({ status, date: dateParam });

  return (
    <div className="flex flex-col gap-5 py-2">
      <BookingFilters currentStatus={status} currentDate={dateParam} />

      {bookings.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
          <p className="text-text/60">Бронирований по заданным фильтрам не найдено.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-card bg-surface p-5 shadow-[0_2px_12px_rgba(27,27,27,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-text">
                    {toDateOnlyKey(booking.date)} в {booking.time}
                  </p>
                  <p className="mt-0.5 text-sm text-text/60">
                    {booking.guestsCount} гостей · Стол {booking.table.name}
                  </p>
                  <p className="mt-1 text-sm text-text/60">
                    {booking.user.name} · {booking.user.email}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <BookingActions bookingId={booking.id} status={booking.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
