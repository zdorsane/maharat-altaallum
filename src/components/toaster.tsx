"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type Flash = { message: string; tone: "success" | "error" | "info" };

function readFlash(): Flash | null {
  const m = document.cookie.match(/(?:^|; )mt_flash=([^;]*)/);
  if (!m) return null;
  document.cookie = "mt_flash=; Max-Age=0; path=/";
  try {
    return JSON.parse(decodeURIComponent(decodeURIComponent(m[1])));
  } catch {
    return null;
  }
}

export function Toaster() {
  const pathname = usePathname();
  const [flash, setFlash] = useState<Flash | null>(null);

  useEffect(() => {
    const f = readFlash();
    if (!f) return;
    setFlash(f);
    const t = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!flash) return null;
  const Icon = flash.tone === "error" ? XCircle : flash.tone === "info" ? Info : CheckCircle2;
  const tone = flash.tone === "error" ? "bg-coral-soft text-coral" : flash.tone === "info" ? "bg-primary-soft text-primary" : "bg-mint-soft text-mint";
  return (
    <div
      role="status"
      className="animate-toast glass fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border p-3 pe-5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)]"
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium">{flash.message}</p>
    </div>
  );
}
