"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTableAction } from "@/lib/admin/table-actions";

export function TableForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let result;
    try {
      result = await createTableAction({ name, capacity });
    } catch {
      setIsSubmitting(false);
      router.push("/login");
      return;
    }
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setName("");
    setCapacity(2);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Название
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Вместимость
        <input
          type="number"
          min={1}
          max={8}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="rounded border border-neutral-300 px-2 py-1"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {isSubmitting ? "Добавляем..." : "Добавить стол"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
