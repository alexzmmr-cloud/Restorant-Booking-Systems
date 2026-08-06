import { listRecentAuditLog } from "@/lib/admin/audit-log-queries";

export default async function AdminAuditLogPage() {
  const entries = await listRecentAuditLog();

  return (
    <div className="py-2">
      {entries.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
          <p className="text-text/60">Записей пока нет.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-semibold text-text">Дата</th>
                <th className="px-5 py-3 font-semibold text-text">Кто</th>
                <th className="px-5 py-3 font-semibold text-text">Действие</th>
                <th className="px-5 py-3 font-semibold text-text">Объект</th>
                <th className="px-5 py-3 font-semibold text-text">Детали</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={[
                    "border-b border-border transition-colors duration-200 hover:bg-accent/8",
                    i % 2 === 1 ? "bg-background/60" : "bg-transparent",
                  ].join(" ")}
                >
                  <td className="px-5 py-3 whitespace-nowrap text-text/50 tabular-nums">
                    {entry.createdAt.toLocaleString("ru-RU")}
                  </td>
                  <td className="px-5 py-3 text-text">
                    {entry.actor.name}{" "}
                    <span className="text-text/50">({entry.actor.role})</span>
                  </td>
                  <td className="px-5 py-3">
                    <code className="rounded-control bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {entry.action}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-text/70">
                    {entry.targetType} #{entry.targetId.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3 text-text/50">
                    {entry.metadata ? JSON.stringify(entry.metadata) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
