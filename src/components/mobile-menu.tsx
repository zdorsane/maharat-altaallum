"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileMenu({ label, links }: { label: string; links: { href: string; label: string; primary?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
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

  return (
    <div ref={ref} className="relative lg:hidden">
      <button type="button" className="icon-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
      </button>
      {open && (
        <div className="animate-pop-in absolute end-0 top-full z-50 mt-3 w-64 rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.4)]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(l.primary ? "btn-primary mt-2 w-full" : "block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-2")}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
