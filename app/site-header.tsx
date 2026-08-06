import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, isRead: false } })
    : 0;

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
        <Link href="/" className="font-semibold">
          Verde Marea
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/book" className="underline">
              Забронировать
            </Link>
            <Link href="/bookings" className="underline">
              Мои бронирования
            </Link>
            <Link href="/notifications" className="relative underline">
              Уведомления
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="underline">
                Выйти
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="underline">
              Войти
            </Link>
            <Link href="/register" className="underline">
              Регистрация
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
