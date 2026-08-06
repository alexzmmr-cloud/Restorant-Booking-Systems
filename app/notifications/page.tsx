import { requireUserOrRedirect } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { MarkReadButton } from "./mark-read-button";

export default async function NotificationsPage() {
  const user = await requireUserOrRedirect();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 lg:px-0">
      <h1 className="mb-8 font-display text-3xl font-semibold text-primary">Уведомления</h1>

      {notifications.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
          <p className="text-text/60">Уведомлений пока нет.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={[
                "rounded-card p-5 shadow-[0_2px_12px_rgba(27,27,27,0.06)]",
                notification.isRead ? "bg-surface" : "bg-accent/10",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                {!notification.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
                <p className={notification.isRead ? "text-text/60" : "text-text"}>
                  {notification.message}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between pl-5">
                <span className="text-xs text-text/40">
                  {notification.createdAt.toLocaleString("ru-RU")}
                </span>
                {!notification.isRead && <MarkReadButton notificationId={notification.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
