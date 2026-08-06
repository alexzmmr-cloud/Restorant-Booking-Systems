"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserRoleAction } from "@/lib/admin/role-actions";

type User = { id: string; name: string; email: string; role: "user" | "admin" | "super_admin" };

const ROLE_LABELS: Record<User["role"], string> = {
  user: "Гость",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_STYLES: Record<User["role"], string> = {
  user: "bg-text/8 text-text/60",
  admin: "bg-primary/15 text-primary",
  super_admin: "bg-accent/30 text-text",
};

export function UserRow({
  user,
  isSelf,
  striped,
}: {
  user: User;
  isSelf: boolean;
  striped: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChangeRole(newRole: "user" | "admin") {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await changeUserRoleAction(user.id, newRole);
      } catch {
        router.push("/login");
        return;
      }
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <tr
      className={[
        "border-b border-border transition-colors duration-200 hover:bg-accent/8",
        striped ? "bg-background/60" : "bg-transparent",
      ].join(" ")}
    >
      <td className="px-5 py-3 font-medium text-text">{user.name}</td>
      <td className="px-5 py-3 text-text/70">{user.email}</td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center rounded-control px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[user.role]}`}
        >
          {ROLE_LABELS[user.role]}
        </span>
      </td>
      <td className="px-5 py-3">
        {user.role === "super_admin" ? (
          <span className="text-xs text-text/40">роль не изменяется через интерфейс</span>
        ) : isSelf ? (
          <span className="text-xs text-text/40">это вы</span>
        ) : (
          <div className="flex items-center gap-3">
            {user.role === "user" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleChangeRole("admin")}
                className="rounded-control border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-background disabled:opacity-40"
              >
                Повысить до admin
              </button>
            )}
            {user.role === "admin" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleChangeRole("user")}
                className="rounded-control border border-border px-3 py-1.5 text-xs font-semibold text-text/70 transition-colors duration-200 hover:border-text/40 hover:text-text disabled:opacity-40"
              >
                Понизить до user
              </button>
            )}
            {error && <span className="text-xs text-error">{error}</span>}
          </div>
        )}
      </td>
    </tr>
  );
}
