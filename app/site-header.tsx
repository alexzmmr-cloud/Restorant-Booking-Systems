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
      <Link
        href="/"
        className="font-display text-3xl font-bold tracking-wide text-accent transition-opacity duration-200 hover:opacity-80 lg:text-4xl"
      >
        Verde Marea
      </Link>

      {user ? (
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/book" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
            Забронировать
          </Link>
          <Link href="/bookings" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
            Мои бронирования
          </Link>
          <Link
            href="/notifications"
            className="relative text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100"
          >
            Уведомления
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          {(user.role === "admin" || user.role === "super_admin") && (
            <Link href="/admin/bookings" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
              Администрирование
            </Link>
          )}
          <span
            title={`${user.name} (${user.email})`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/60 bg-accent/15 font-display text-sm font-semibold text-current"
          >
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
          <form action={logoutAction}>
            <button type="submit" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
              Выйти
            </button>
          </form>
        </nav>
      ) : (
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/book" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
            Забронировать
          </Link>
          <Link href="/login" className="text-current opacity-90 transition-colors duration-200 hover:text-accent hover:opacity-100">
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
