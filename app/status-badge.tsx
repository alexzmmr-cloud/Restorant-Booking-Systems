import type { BookingStatus } from "@/lib/generated/prisma/client";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
  completed: "Завершено",
  no_show: "Неявка",
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-accent/25 text-text",
  confirmed: "bg-primary/15 text-primary",
  cancelled: "bg-text/8 text-text/60",
  completed: "bg-primary text-background",
  no_show: "bg-error/15 text-error",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-control px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
