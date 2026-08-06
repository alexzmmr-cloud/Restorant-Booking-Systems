"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/auth/actions";
import { registerSchema } from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Некорректные данные");
      return;
    }

    setIsSubmitting(true);
    const result = await registerAction(parsed.data);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm rounded-card bg-surface p-10 shadow-[0_4px_24px_rgba(27,27,27,0.08)]">
        <h1 className="font-display text-3xl font-semibold text-primary">Регистрация</h1>
        <p className="mt-2 text-sm text-text/60">Создайте аккаунт, чтобы бронировать столы</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Имя</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text transition-colors duration-200 outline-none focus:border-primary"
              required
            />
          </label>
          {error && (
            <p className="rounded-control border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-control bg-primary px-4 py-3 text-sm font-semibold text-background transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
