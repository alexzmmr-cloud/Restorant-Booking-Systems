"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationReadAction } from "@/lib/booking/notification-actions";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await markNotificationReadAction(notificationId);
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPending ? "..." : "Отметить прочитанным"}
    </button>
  );
}
