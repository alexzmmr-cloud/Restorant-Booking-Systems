"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLanding) return;

    const heroEl = document.getElementById("hero");

    function evaluate() {
      const heroHeight = heroEl?.offsetHeight ?? 0;
      setScrolled(window.scrollY >= heroHeight);
    }

    evaluate();
    window.addEventListener("scroll", evaluate);
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [isLanding]);

  const transparent = isLanding && !scrolled;

  return (
    <header
      className={[
        "top-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ease-in-out",
        isLanding ? "fixed" : "sticky",
        transparent
          ? "bg-text/25 text-white"
          : isLanding
            ? "bg-background text-text shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
            : "bg-background text-text border-b border-border",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-12">
        {children}
      </div>
    </header>
  );
}
