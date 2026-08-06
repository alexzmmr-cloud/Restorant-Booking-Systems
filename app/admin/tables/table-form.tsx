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
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-card bg-surface p-5 shadow-[0_2px_12px_rgba(27,27,27,0.06)]"
    >
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-text">Название</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-control border border-border bg-background px-3 py-2 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-text">Вместимость</span>
        <input
          type="number"
          min={1}
          max={8}
          value={capacity}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              setCapacity(1);
              return;
            }
            const parsed = Number(raw);
            if (Number.isNaN(parsed)) return;
            setCapacity(Math.min(8, Math.max(1, parsed)));
          }}
          className="w-24 rounded-control border border-border bg-background px-3 py-2 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Добавляем..." : "Добавить стол"}
      </button>
      {error && <span className="text-sm text-error">{error}</span>}
    </form>
  );
}
