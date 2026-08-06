import { listAllTables } from "@/lib/admin/table-queries";
import { TableForm } from "./table-form";
import { TableRow } from "./table-row";

export default async function AdminTablesPage() {
  const tables = await listAllTables();

  return (
    <div className="flex flex-col gap-6">
      <TableForm />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="py-2 pr-4">Название</th>
            <th className="py-2 pr-4">Вместимость</th>
            <th className="py-2 pr-4">Статус</th>
            <th className="py-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <TableRow key={table.id} table={table} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
