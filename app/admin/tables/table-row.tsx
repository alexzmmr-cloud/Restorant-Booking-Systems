"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTableAction, toggleTableActiveAction } from "@/lib/admin/table-actions";

type Table = { id: string; name: string; capacity: number; isActive: boolean };

export function TableRow({ table, striped }: { table: Table; striped: boolean }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const rowBg = striped ? "bg-background/60" : "bg-transparent";

  async function handleSave() {
    setError(null);
    setIsPending(true);
    let result;
    try {
      result = await updateTableAction({ id: table.id, name, capacity });
    } catch {
      setIsPending(false);
      router.push("/login");
      return;
    }
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  async function handleToggleActive() {
    setError(null);
    setIsPending(true);
    let result;
    try {
      result = await toggleTableActiveAction(table.id, !table.isActive);
    } catch {
      setIsPending(false);
      router.push("/login");
      return;
    }
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  const statusPill = (
    <span
      className={[
        "inline-flex items-center rounded-control px-2.5 py-1 text-xs font-semibold",
        table.isActive ? "bg-primary/15 text-primary" : "bg-text/8 text-text/60",
      ].join(" ")}
    >
      {table.isActive ? "Активен" : "Деактивирован"}
    </span>
  );

  if (isEditing) {
    return (
      <tr className={`border-b border-border ${rowBg}`}>
        <td className="px-5 py-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-control border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
        </td>
        <td className="px-5 py-3">
          <input
            type="number"
            min={1}
            max={8}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-20 rounded-control border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
        </td>
        <td className="px-5 py-3">{statusPill}</td>
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="rounded-control border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-background disabled:opacity-40"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-text/50 hover:text-text"
            >
              Отмена
            </button>
            {error && <span className="text-xs text-error">{error}</span>}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-border transition-colors duration-200 hover:bg-accent/8 ${rowBg}`}>
      <td className="px-5 py-3 font-medium text-text">{table.name}</td>
      <td className="px-5 py-3 text-text/70">{table.capacity}</td>
      <td className="px-5 py-3">{statusPill}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Редактировать
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleActive}
            className="text-xs font-semibold text-text/60 hover:text-text disabled:opacity-40"
          >
            {table.isActive ? "Деактивировать" : "Активировать"}
          </button>
          {error && <span className="text-xs text-error">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
