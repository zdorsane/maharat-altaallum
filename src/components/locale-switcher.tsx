"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Languages, LoaderCircle } from "lucide-react";
import { setLocaleAction } from "@/app/preferences";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, dirOf, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ locale, label, placement = "bottom" }: { locale: Locale; label: string; placement?: "bottom" | "top" }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className="icon-btn w-auto px-2.5"
      >
        <span className="flex items-center gap-1.5">
          {pending ? <LoaderCircle className="size-[18px] animate-spin" /> : <Languages className="size-[18px]" />}
          <span className="text-xs font-bold">{LOCALE_SHORT[locale]}</span>
        </span>
      </button>
      {open && (
        <ul
          role="menu"
          className={cn(
            "animate-pop-in absolute end-0 z-50 w-44 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)]",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === locale}
                lang={l}
                dir={dirOf(l)}
                onClick={() => choose(l)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-surface-2",
                  l === locale && "font-semibold text-primary",
                )}
              >
                <span>{LOCALE_NAMES[l]}</span>
                {l === locale && <Check className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
