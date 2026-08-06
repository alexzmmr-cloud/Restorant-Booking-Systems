import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";
import { SiteHeaderShell } from "./site-header-shell";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, isRead: false } })
    : 0;

  return (
    <SiteHeaderShell>
      <Link href="/" className="font-display text-xl font-semibold tracking-wide">
        Verde Marea
      </Link>

      {user ? (
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/book" className="opacity-90 transition-opacity hover:opacity-100">
            Забронировать
          </Link>
          <Link href="/bookings" className="opacity-90 transition-opacity hover:opacity-100">
            Мои бронирования
          </Link>
          <Link
            href="/notifications"
            className="relative opacity-90 transition-opacity hover:opacity-100"
          >
            Уведомления
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          {(user.role === "admin" || user.role === "super_admin") && (
            <Link href="/admin/bookings" className="opacity-90 transition-opacity hover:opacity-100">
              Администрирование
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" className="opacity-90 transition-opacity hover:opacity-100">
              Выйти
            </button>
          </form>
        </nav>
      ) : (
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/login" className="opacity-90 transition-opacity hover:opacity-100">
            Войти
          </Link>
          <Link
            href="/register"
            className="rounded-control bg-primary px-4 py-2 text-background transition-colors duration-200 hover:bg-primary-hover"
          >
            Регистрация
          </Link>
        </nav>
      )}
    </SiteHeaderShell>
  );
}
