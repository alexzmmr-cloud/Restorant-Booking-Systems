import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/actions";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Verde Marea</h1>
      {user ? (
        <div className="flex flex-col gap-3">
          <p>
            Вы вошли как <strong>{user.name}</strong> ({user.email}, роль: {user.role})
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded border border-neutral-300 px-4 py-2"
            >
              Выйти
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p>Вы не вошли в систему.</p>
          <Link href="/login" className="underline">
            Войти
          </Link>
          <Link href="/register" className="underline">
            Зарегистрироваться
          </Link>
        </div>
      )}
    </main>
  );
}
