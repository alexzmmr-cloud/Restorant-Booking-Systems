import type { BookingStatus } from "@/lib/generated/prisma/client";
import { listBookingsForAdmin } from "@/lib/admin/booking-queries";
import { toDateOnlyKey } from "@/lib/booking/rules";
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
    <div className="flex flex-col gap-4">
      <BookingFilters currentStatus={status} currentDate={dateParam} />

      {bookings.length === 0 ? (
        <p className="text-neutral-500">Бронирований по заданным фильтрам не найдено.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <p>
                  {toDateOnlyKey(booking.date)} в {booking.time}, {booking.guestsCount} гостей
                </p>
                <span className="text-sm font-medium">{booking.status}</span>
              </div>
              <p className="text-sm text-neutral-500">
                Гость: {booking.user.name} ({booking.user.email}) · Стол: {booking.table.name}
              </p>
              <BookingActions bookingId={booking.id} status={booking.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
