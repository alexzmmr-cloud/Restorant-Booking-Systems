"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/bookings", label: "Бронирования" },
  { href: "/admin/tables", label: "Столы" },
  { href: "/admin/audit-log", label: "История изменений" },
] as const;

export function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  const links = isSuperAdmin
    ? [...LINKS, { href: "/admin/users", label: "Пользователи и роли" }]
    : LINKS;

  return (
    <nav className="flex gap-1 border-b border-border">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "rounded-t-[8px] px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
              active
                ? "bg-accent/40 text-primary"
                : "text-text/60 hover:text-primary",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
