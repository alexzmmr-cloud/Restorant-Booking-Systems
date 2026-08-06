"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTableAction, toggleTableActiveAction } from "@/lib/admin/table-actions";

type Table = { id: string; name: string; capacity: number; isActive: boolean };

export function TableRow({ table }: { table: Table }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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

  if (isEditing) {
    return (
      <tr className="border-b border-neutral-100">
        <td className="py-2 pr-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-neutral-300 px-2 py-1"
          />
        </td>
        <td className="py-2 pr-4">
          <input
            type="number"
            min={1}
            max={8}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-20 rounded border border-neutral-300 px-2 py-1"
          />
        </td>
        <td className="py-2 pr-4">{table.isActive ? "активен" : "деактивирован"}</td>
        <td className="py-2">
          <div className="flex items-center gap-3">
            <button type="button" disabled={isPending} onClick={handleSave} className="text-sm underline">
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm underline text-neutral-500"
            >
              Отмена
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100">
      <td className="py-2 pr-4">{table.name}</td>
      <td className="py-2 pr-4">{table.capacity}</td>
      <td className="py-2 pr-4">{table.isActive ? "активен" : "деактивирован"}</td>
      <td className="py-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsEditing(true)} className="text-sm underline">
            Редактировать
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleActive}
            className="text-sm underline"
          >
            {table.isActive ? "Деактивировать" : "Активировать"}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
