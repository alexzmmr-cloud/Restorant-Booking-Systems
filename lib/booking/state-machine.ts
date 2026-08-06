import type { BookingStatus } from "@/lib/generated/prisma/client";

/** Допустимые переходы статусов для admin/super_admin (specification.md, "Машина состояний Booking"). */
const ADMIN_ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed", "no_show"],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function isAdminTransitionAllowed(from: BookingStatus, to: BookingStatus): boolean {
  return ADMIN_ALLOWED_TRANSITIONS[from].includes(to);
}
