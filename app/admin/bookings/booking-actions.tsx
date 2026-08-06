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

type ActionKind = "primary" | "neutral" | "danger";

const ACTIONS_BY_STATUS: Record<
  BookingStatus,
  Array<{ label: string; kind: ActionKind; action: (id: string) => Promise<AdminActionResult> }>
> = {
  pending: [
    { label: "Подтвердить", kind: "primary", action: confirmBookingAction },
    { label: "Отменить", kind: "danger", action: cancelBookingAsAdminAction },
  ],
  confirmed: [
    { label: "Завершить", kind: "primary", action: completeBookingAction },
    { label: "Неявка", kind: "neutral", action: markNoShowAction },
    { label: "Отменить", kind: "danger", action: cancelBookingAsAdminAction },
  ],
  cancelled: [],
  completed: [],
  no_show: [],
};

const KIND_STYLES: Record<ActionKind, string> = {
  primary:
    "border border-primary text-primary hover:bg-primary hover:text-background",
  neutral:
    "border border-border text-text/70 hover:border-text/40 hover:text-text",
  danger:
    "border border-error text-error hover:bg-error hover:text-white",
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
    <div className="mt-4 flex items-center gap-2.5">
      {actions.map(({ label, kind, action }) => (
        <button
          key={label}
          type="button"
          disabled={isPending}
          onClick={() => handleAction(action)}
          className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${KIND_STYLES[kind]}`}
        >
          {label}
        </button>
      ))}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
