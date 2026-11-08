"use client";

import { Moon, Sun } from "lucide-react";

type VTDocument = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/** Inline script run before paint so the saved/system theme applies without a flash. */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('mt-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){d.dataset.theme='light'}})();`;

export function ThemeToggle({ label }: { label: string }) {
  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem("mt-theme", next);
      } catch {}
    };

    const doc = document as VTDocument;
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();

    // Circular reveal of the new theme, centred on the button.
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className="icon-btn relative overflow-hidden">
      <Sun className="size-[18px] text-sun transition duration-500 dark:scale-0 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute size-[18px] scale-0 rotate-90 text-primary opacity-0 transition duration-500 dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </button>
  );
}
