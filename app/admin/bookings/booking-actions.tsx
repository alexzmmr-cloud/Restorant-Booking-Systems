"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import {
  confirmBookingAction,
  cancelBookingAsAdminAction,
  completeBookingAction,
  markNoShowAction,
  type AdminActionResult,
} from "@/lib/admin/booking-actions";

const ACTIONS_BY_STATUS: Record<
  BookingStatus,
  Array<{ label: string; action: (id: string) => Promise<AdminActionResult> }>
> = {
  pending: [
    { label: "Подтвердить", action: confirmBookingAction },
    { label: "Отменить", action: cancelBookingAsAdminAction },
  ],
  confirmed: [
    { label: "Завершить", action: completeBookingAction },
    { label: "Неявка", action: markNoShowAction },
    { label: "Отменить", action: cancelBookingAsAdminAction },
  ],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function BookingActions({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const actions = ACTIONS_BY_STATUS[status];
  if (actions.length === 0) return null;

  function handleAction(action: (id: string) => Promise<AdminActionResult>) {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await action(bookingId);
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
    <div className="mt-2 flex items-center gap-3">
      {actions.map(({ label, action }) => (
        <button
          key={label}
          type="button"
          disabled={isPending}
          onClick={() => handleAction(action)}
          className="text-sm underline disabled:opacity-40"
        >
          {label}
        </button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
