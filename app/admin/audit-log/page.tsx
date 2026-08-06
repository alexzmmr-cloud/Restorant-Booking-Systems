import { listRecentAuditLog } from "@/lib/admin/audit-log-queries";

export default async function AdminAuditLogPage() {
  const entries = await listRecentAuditLog();

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className="text-neutral-500">Записей пока нет.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="py-2 pr-4">Дата</th>
              <th className="py-2 pr-4">Кто</th>
              <th className="py-2 pr-4">Действие</th>
              <th className="py-2 pr-4">Объект</th>
              <th className="py-2">Детали</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-neutral-100">
                <td className="py-2 pr-4 text-neutral-500">
                  {entry.createdAt.toLocaleString("ru-RU")}
                </td>
                <td className="py-2 pr-4">
                  {entry.actor.name} ({entry.actor.role})
                </td>
                <td className="py-2 pr-4">{entry.action}</td>
                <td className="py-2 pr-4">
                  {entry.targetType} #{entry.targetId.slice(0, 8)}
                </td>
                <td className="py-2 text-neutral-500">
                  {entry.metadata ? JSON.stringify(entry.metadata) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
