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
    <div className="mt-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="text-sm text-red-600 underline disabled:opacity-40"
      >
        {isPending ? "Отменяем..." : "Отменить"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
