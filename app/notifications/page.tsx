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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Уведомления</h1>

      {notifications.length === 0 ? (
        <p className="text-neutral-500">Уведомлений пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`rounded border p-4 ${
                notification.isRead ? "border-neutral-200" : "border-neutral-900"
              }`}
            >
              <p>{notification.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
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
