import { requireUserOrRedirect } from "@/lib/auth/require-role";
import { BookingForm } from "./booking-form";

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  await requireUserOrRedirect();
  const params = await searchParams;

  const guestsParam = typeof params.guests === "string" ? Number(params.guests) : undefined;
  const dateParam = typeof params.date === "string" ? params.date : undefined;
  const timeParam = typeof params.time === "string" ? params.time : undefined;

  const initialGuestsCount =
    guestsParam && Number.isInteger(guestsParam) && guestsParam >= 1 && guestsParam <= 8
      ? guestsParam
      : undefined;

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <BookingForm
        initialGuestsCount={initialGuestsCount}
        initialDate={dateParam}
        initialTime={timeParam}
      />
    </main>
  );
}
