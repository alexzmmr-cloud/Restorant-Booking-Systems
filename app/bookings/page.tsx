import Link from "next/link";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import { requireUserOrRedirect } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "../status-badge";
import { CancelButton } from "./cancel-button";

/** Активные брони (ждут визита) — сверху, ближайшая дата первой; терминальные — снизу. */
const STATUS_GROUP: Record<BookingStatus, 0 | 1> = {
  pending: 0,
  confirmed: 0,
  completed: 1,
  cancelled: 1,
  no_show: 1,
};

export default async function BookingsPage() {
  const user = await requireUserOrRedirect();

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { table: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  bookings.sort((a, b) => STATUS_GROUP[a.status] - STATUS_GROUP[b.status]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 lg:px-0">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-primary">Мои бронирования</h1>
        <Link
          href="/book"
          className="rounded-control border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover hover:border-primary-hover"
        >
          Забронировать ещё
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
          <p className="text-text/60">У вас пока нет бронирований.</p>
          <Link
            href="/book"
            className="mt-4 inline-block rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover"
          >
            Забронировать стол
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-card bg-surface p-6 shadow-[0_2px_12px_rgba(27,27,27,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-text">
                    {booking.date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" })}{" "}
                    в {booking.time}
                  </p>
                  <p className="mt-1 text-sm text-text/60">
                    {booking.guestsCount} гостей · {booking.table.name}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <CancelButton bookingId={booking.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
