"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/lib/booking/actions";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await cancelBookingAction(bookingId);
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
    <div className="mt-4 flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-control border border-error px-3.5 py-1.5 text-xs font-semibold text-error transition-colors duration-200 hover:bg-error hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Отменяем..." : "Отменить бронирование"}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
