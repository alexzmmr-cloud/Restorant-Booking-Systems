import { requireUserOrRedirect } from "@/lib/auth/require-role";
import { BookingForm } from "./booking-form";

export default async function BookPage() {
  await requireUserOrRedirect();
  return <BookingForm />;
}
