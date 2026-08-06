import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import heroCoast from "@/public/images/hero-coast.jpg";
import { TableCard } from "./table-card";

export default async function Home() {
  const user = await getCurrentUser();

  const tables = await prisma.table.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col">
      <section
        id="hero"
        className="relative flex min-h-[92vh] items-stretch"
        style={{
          backgroundImage: "linear-gradient(135deg, #24513e 0%, #1a3a2c 60%, #12281e 100%)",
        }}
      >
        <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-16 text-center lg:w-3/5 lg:flex-none lg:px-16 lg:pt-32 lg:pb-24">
          <div className="max-w-xl text-background">
            <span className="mb-4 block text-sm tracking-[0.12em] text-accent uppercase">
              Ресторан у моря
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
              Verde Marea — место, где море у ваших ног
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-background/90">
              Средиземноморская кухня с видом на бухту. Выберите стол под своё
              настроение — на двоих, для компании или большого праздника — и мы
              подготовим его к вашему приходу.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/book"
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
        </div>

        <div className="relative hidden overflow-hidden lg:block lg:w-2/5">
          <Image
            src={heroCoast}
            alt="Скалистый берег и сосна над бирюзовым морем"
            fill
            priority
            sizes="40vw"
            className="scale-105 object-cover blur-[2px]"
          />
          {/* "За стеклом": затемнение зелёным тоном бренда поверх фото + виньетка к краю, чтобы фото читалось как атмосфера, не как главный объект */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(18,40,30,0.55) 0%, rgba(18,40,30,0.3) 25%, rgba(18,40,30,0.38) 100%)",
            }}
          />
        </div>
      </section>

      {user ? (
        <TablesShowcase tables={tables} userName={user.name} />
      ) : (
        <RegistrationPitch />
      )}
    </main>
  );
}

function ScrollCue() {
  return (
    <a
      href="#content"
      aria-label="Прокрутить вниз"
      className="group absolute top-6 left-1/2 flex w-fit -translate-x-1/2 flex-col items-center gap-2 text-accent transition-colors duration-200 hover:text-primary"
    >
      <svg
        width="34"
        height="20"
        viewBox="0 0 34 20"
        fill="none"
        className="animate-bounce"
      >
        <path
          d="M1 1c4 4 7 6 11 6s7-2 11-6c4 4 7 6 10 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="opacity-100"
        />
        <path
          d="M1 9c4 4 7 6 11 6s7-2 11-6c4 4 7 6 10 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="opacity-55"
        />
      </svg>
      <span className="text-[11px] tracking-[0.14em] uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Листайте вниз
      </span>
    </a>
  );
}

function TablesShowcase({
  tables,
  userName,
}: {
  tables: { id: string; name: string; capacity: number }[];
  userName: string;
}) {
  return (
    <section id="content" className="relative flex min-h-screen flex-col justify-center bg-background px-6 py-20 lg:px-12">
      <ScrollCue />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-3 block text-sm tracking-[0.12em] text-primary/70 uppercase">
              С возвращением, {userName}
            </span>
            <h2 className="font-display text-4xl font-semibold text-primary text-balance">
              Столы Verde Marea
            </h2>
            <p className="mt-3 max-w-md text-text/70">
              У нас {tables.length} {tables.length === 1 ? "стол" : "столов"} разной
              вместимости — выберите дату, и мы подберём подходящий автоматически.
            </p>
          </div>
          <Link
            href="/book"
            className="rounded-control bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
          >
            Забронировать стол
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistrationPitch() {
  const benefits = [
    {
      title: "Бронь за минуту",
      description: "Выберите дату и время — стол подбирается автоматически по вместимости.",
    },
    {
      title: "Всё под рукой",
      description: "Список бронирований и уведомления о статусе — в личном кабинете.",
    },
    {
      title: "Гибкая отмена",
      description: "Отменить бронь можно бесплатно не позднее чем за 3 часа до начала.",
    },
  ];

  return (
    <section id="content" className="relative flex min-h-screen flex-col justify-center bg-background px-6 py-20 lg:px-12">
      <ScrollCue />
      <div className="mx-auto w-full max-w-4xl text-center">
        <span className="mb-3 block text-sm tracking-[0.12em] text-primary/70 uppercase">
          Личный кабинет
        </span>
        <h2 className="font-display text-4xl font-semibold text-primary text-balance">
          Зарегистрируйтесь — и бронируйте в пару кликов
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-text/70">
          Аккаунт нужен, чтобы система запомнила ваши бронирования и уведомляла о
          подтверждении.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-card border-t-2 border-accent bg-surface p-6 text-left shadow-[0_2px_12px_rgba(27,27,27,0.06)]"
            >
              <h3 className="font-display text-xl font-semibold text-text">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-text/60">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-control bg-primary px-7 py-3.5 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
          >
            Создать аккаунт
          </Link>
          <Link
            href="/login"
            className="rounded-control border border-primary px-7 py-3.5 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover hover:border-primary-hover"
          >
            Уже есть аккаунт — войти
          </Link>
        </div>
      </div>
    </section>
  );
}
