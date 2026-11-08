import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Four-stage progress of a case as parents see it; `stage` -1 means closed. */
export function CaseStages({ stage, labels, closedLabel }: { stage: number; labels: string[]; closedLabel: string }) {
  if (stage < 0) return <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm font-semibold text-muted">{closedLabel}</p>;
  return (
    <ol className="grid grid-cols-4 gap-2">
      {labels.map((l, i) => {
        const done = i < stage;
        const current = i === stage;
        return (
          <li key={l} className="flex flex-col items-center gap-2 text-center">
            <span className="relative flex w-full items-center">
              <span className={cn("h-1 flex-1 rounded-full", i === 0 ? "bg-transparent" : i <= stage ? "bg-primary" : "bg-line")} />
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold transition",
                  done && "bg-primary text-on-primary",
                  current && "bg-primary text-on-primary ring-4 ring-primary/20",
                  !done && !current && "bg-surface-2 text-muted",
                )}
                aria-current={current ? "step" : undefined}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("h-1 flex-1 rounded-full", i === labels.length - 1 ? "bg-transparent" : i < stage ? "bg-primary" : "bg-line")} />
            </span>
            <span className={cn("text-xs font-semibold", current ? "text-primary" : "text-muted")}>{l}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
      <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 rtl:group-hover:translate-x-0.5" />
      {children}
    </Link>
  );
}

/** Label/value pair used in detail panels. */
export function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-muted uppercase">{label}</dt>
      <dd dir="auto" className="mt-1 whitespace-pre-line">{children}</dd>
    </div>
  );
}
