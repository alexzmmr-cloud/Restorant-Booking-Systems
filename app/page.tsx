import { getCurrentUser } from "@/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Verde Marea</h1>
      {user ? (
        <p>
          Вы вошли как <strong>{user.name}</strong> ({user.email}, роль: {user.role})
        </p>
      ) : (
        <p>Вы не вошли в систему.</p>
      )}
    </main>
  );
}
