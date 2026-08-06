"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { loginSchema } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Некорректные данные");
      return;
    }

    setIsSubmitting(true);
    const result = await loginAction(parsed.data);
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
        <h1 className="font-display text-3xl font-semibold text-primary">Вход</h1>
        <p className="mt-2 text-sm text-text/60">Войдите, чтобы забронировать стол</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
            {isSubmitting ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
