import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

const TONES = {
  info: "bg-primary-soft text-primary",
  primary: "bg-primary-soft text-primary",
  warn: "bg-sun-soft text-sun-ink",
  violet: "bg-violet-soft text-violet",
  success: "bg-mint-soft text-mint",
  danger: "bg-coral-soft text-coral",
  neutral: "bg-surface-2 text-muted",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TONES[tone], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STAT_TONES = {
  primary: "from-primary/15 text-primary",
  mint: "from-mint/15 text-mint",
  sun: "from-sun/20 text-sun-ink",
  coral: "from-coral/15 text-coral",
  violet: "from-violet/15 text-violet",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "primary",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: keyof typeof STAT_TONES;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card card-hover relative overflow-hidden">
      <div className={cn("pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-radial to-transparent blur-xl", STAT_TONES[tone])} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon && <span className={cn("grid size-9 place-items-center rounded-xl bg-surface-2", STAT_TONES[tone])}>{icon}</span>}
      </div>
      <p className="relative mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums">{value}</p>
      {hint && <p className="relative mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-surface-2 text-muted">
        <Info className="size-5" />
      </span>
      <p className="font-semibold">{title}</p>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("card", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}

export async function Disclaimer({ className }: { className?: string }) {
  const { t } = await getI18n();
  return (
    <p className={cn("flex items-start gap-3 rounded-2xl border border-sun/30 bg-sun-soft px-4 py-3 text-sm text-sun-ink", className)}>
      <Info className="mt-0.5 size-4 shrink-0" />
      {t.common.disclaimer}
    </p>
  );
}
