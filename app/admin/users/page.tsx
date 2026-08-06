import { requireRoleOrRedirect } from "@/lib/auth/require-role";
import { listAllUsers } from "@/lib/admin/user-queries";
import { UserRow } from "./user-row";

export default async function AdminUsersPage() {
  const currentUser = await requireRoleOrRedirect(["super_admin"]);
  const users = await listAllUsers();

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left">
          <th className="py-2 pr-4">Имя</th>
          <th className="py-2 pr-4">Email</th>
          <th className="py-2 pr-4">Роль</th>
          <th className="py-2">Действия</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} isSelf={user.id === currentUser.id} />
        ))}
      </tbody>
    </table>
  );
}
