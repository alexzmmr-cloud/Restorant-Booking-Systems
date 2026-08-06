import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { CancelButton } from "./cancel-button";

export default async function BookingsPage() {
  const user = await requireUserOrRedirect();

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { table: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Мои бронирования</h1>
        <Link href="/book" className="text-sm underline">
          Забронировать ещё
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-neutral-500">У вас пока нет бронирований.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded border border-neutral-200 p-4">
              <p>
                {booking.date.toISOString().slice(0, 10)} в {booking.time}, {booking.guestsCount} гостей
              </p>
              <p className="text-sm text-neutral-500">
                Стол: {booking.table.name} · Статус: {booking.status}
              </p>
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
