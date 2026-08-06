import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col">
      <section
        className="relative flex min-h-[92vh] items-end px-6 pb-16 lg:px-12 lg:pb-24"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(27,27,27,0.15) 0%, rgba(27,27,27,0.55) 100%), linear-gradient(135deg, #24513e 0%, #1a3a2c 60%, #12281e 100%)",
        }}
      >
        <div className="max-w-xl text-background">
          <span className="mb-4 block text-sm tracking-[0.12em] text-accent uppercase">
            Ресторан у моря
          </span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            Стол ждёт вас на закате
          </h1>
          <p className="mt-5 max-w-md text-lg text-background/90">
            Средиземноморская кухня, терраса с видом на бухту и сервис, который помнит
            ваше имя.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={user ? "/book" : "/login"}
              className="rounded-control bg-primary px-7 py-3.5 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
            >
              Забронировать стол
            </Link>
            {!user && (
              <Link
                href="/register"
                className="rounded-control border border-background/60 px-7 py-3.5 text-sm font-semibold text-background transition-colors duration-200 hover:border-background"
              >
                Создать аккаунт
              </Link>
            )}
          </div>
        </div>
      </section>

      {user && (
        <section className="mx-auto w-full max-w-3xl px-6 py-16 text-center lg:px-12">
          <p className="text-text/70">
            Вы вошли как <strong className="text-text">{user.name}</strong> ({user.email})
          </p>
        </section>
      )}
    </main>
  );
}
