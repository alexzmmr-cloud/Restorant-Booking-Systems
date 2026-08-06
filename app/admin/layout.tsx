import { requireRoleOrRedirect } from "@/lib/auth/require-role";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRoleOrRedirect(["admin", "super_admin"]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10 lg:px-0">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-primary">
          Административный контур
        </h1>
        <span className="rounded-control bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {user.role}
        </span>
      </div>
      <AdminNav isSuperAdmin={user.role === "super_admin"} />
      {children}
    </div>
  );
}
