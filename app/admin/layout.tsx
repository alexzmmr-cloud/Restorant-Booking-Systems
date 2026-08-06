import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/auth/require-role";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRoleOrRedirect(["admin", "super_admin"]);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Административный контур</h1>
        <span className="text-sm text-neutral-500">Роль: {user.role}</span>
      </div>
      <nav className="flex gap-4 border-b border-neutral-200 pb-3 text-sm">
        <Link href="/admin/bookings" className="underline">
          Бронирования
        </Link>
        <Link href="/admin/tables" className="underline">
          Столы
        </Link>
        <Link href="/admin/audit-log" className="underline">
          История изменений
        </Link>
        {user.role === "super_admin" && (
          <Link href="/admin/users" className="underline">
            Пользователи и роли
          </Link>
        )}
      </nav>
      {children}
    </div>
  );
}
