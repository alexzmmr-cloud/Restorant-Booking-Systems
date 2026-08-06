import { requireRoleOrRedirect } from "@/lib/auth/require-role";
import { listAllUsers } from "@/lib/admin/user-queries";
import { UserRow } from "./user-row";

export default async function AdminUsersPage() {
  const currentUser = await requireRoleOrRedirect(["super_admin"]);
  const users = await listAllUsers();

  return (
    <div className="overflow-x-auto rounded-card bg-surface py-2 shadow-[0_2px_12px_rgba(27,27,27,0.06)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-semibold text-text">Имя</th>
            <th className="px-5 py-3 font-semibold text-text">Email</th>
            <th className="px-5 py-3 font-semibold text-text">Роль</th>
            <th className="px-5 py-3 font-semibold text-text">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUser.id}
              striped={i % 2 === 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
