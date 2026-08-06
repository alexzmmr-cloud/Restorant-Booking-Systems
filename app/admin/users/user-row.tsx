"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserRoleAction } from "@/lib/admin/role-actions";

type User = { id: string; name: string; email: string; role: "user" | "admin" | "super_admin" };

export function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
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
    <tr className="border-b border-neutral-100">
      <td className="py-2 pr-4">{user.name}</td>
      <td className="py-2 pr-4">{user.email}</td>
      <td className="py-2 pr-4">{user.role}</td>
      <td className="py-2">
        {user.role === "super_admin" ? (
          <span className="text-xs text-neutral-400">роль не изменяется через интерфейс</span>
        ) : isSelf ? (
          <span className="text-xs text-neutral-400">это вы</span>
        ) : (
          <div className="flex items-center gap-3">
            {user.role === "user" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleChangeRole("admin")}
                className="text-sm underline"
              >
                Повысить до admin
              </button>
            )}
            {user.role === "admin" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleChangeRole("user")}
                className="text-sm underline"
              >
                Понизить до user
              </button>
            )}
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        )}
      </td>
    </tr>
  );
}
