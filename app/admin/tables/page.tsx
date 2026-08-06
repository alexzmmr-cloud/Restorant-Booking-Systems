import { listAllTables } from "@/lib/admin/table-queries";
import { TableForm } from "./table-form";
import { TableRow } from "./table-row";

export default async function AdminTablesPage() {
  const tables = await listAllTables();

  return (
    <div className="flex flex-col gap-6 py-2">
      <TableForm />

      <div className="overflow-x-auto rounded-card bg-surface shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-semibold text-text">Название</th>
              <th className="px-5 py-3 font-semibold text-text">Вместимость</th>
              <th className="px-5 py-3 font-semibold text-text">Статус</th>
              <th className="px-5 py-3 font-semibold text-text">Действия</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table, i) => (
              <TableRow key={table.id} table={table} striped={i % 2 === 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
