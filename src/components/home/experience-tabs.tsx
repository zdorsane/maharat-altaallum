"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, CheckCircle2, GraduationCap, Stethoscope, Users } from "lucide-react";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { cn } from "@/lib/utils";

type Exp = Dict["home"]["experiences"];
type Key = keyof Exp;
const KEYS: Key[] = ["parents", "specialists", "schools"];
const ICONS = { parents: Users, specialists: Stethoscope, schools: GraduationCap };
const LINKS = { parents: "/register", specialists: "/contact", schools: "/contact" };

/** Accessible tabbed showcase (ARIA tabs with arrow-key navigation) for the three audiences. */
export function ExperienceTabs({ data, note, ctas }: { data: Exp; note: string; ctas: Record<Key, string> }) {
  const [active, setActive] = useState<Key>("parents");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKey(e: React.KeyboardEvent, i: number) {
    const rtl = document.documentElement.dir === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (!step) return;
    e.preventDefault();
    const next = KEYS[(i + step + KEYS.length) % KEYS.length];
    setActive(next);
    refs.current[next]?.focus();
  }

  const exp = data[active];
  return (
    <div>
      <div role="tablist" aria-label={data.parents.tab} className="mx-auto mb-10 flex w-fit gap-1 rounded-full border border-line bg-surface p-1.5 shadow-[var(--shadow-card)]">
        {KEYS.map((k, i) => {
          const Icon = ICONS[k];
          const selected = k === active;
          return (
            <button
              key={k}
              ref={(el) => {
                refs.current[k] = el;
              }}
              role="tab"
              id={`tab-${k}`}
              aria-selected={selected}
              aria-controls={`panel-${k}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(k)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition duration-300 sm:px-5",
                selected ? "bg-primary text-on-primary shadow-[var(--shadow-float)]" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-4" />
              {data[k].tab}
            </button>
          );
        })}
      </div>

      <div key={active} role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="animate-fade-up grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="text-2xl font-extrabold sm:text-3xl">{exp.title}</h3>
          <p className="mt-3 text-lead text-muted">{exp.body}</p>
          <ul className="mt-6 space-y-3">
            {exp.points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint-soft text-mint">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="font-medium">{p}</span>
              </li>
            ))}
          </ul>
          <Link href={LINKS[active]} className="btn-primary group mt-8">
            {ctas[active]}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-sun-soft" />
          <div className="card rounded-[1.5rem] p-6 shadow-[var(--shadow-float)]">
            <p className="mb-4 text-end text-[11px] font-semibold tracking-wide text-muted uppercase">{note}</p>
            {active === "parents" && <ParentsPreview p={data.parents.preview} />}
            {active === "specialists" && <SpecialistsPreview p={data.specialists.preview} />}
            {active === "schools" && <SchoolsPreview p={data.schools.preview} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentsPreview({ p }: { p: Exp["parents"]["preview"] }) {
  const current = 2;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-sun text-[#283C48]">
            <Users className="size-5" />
          </span>
          <p className="font-extrabold">{p.title}</p>
        </div>
        <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-mint">{p.status}</span>
      </div>
      <ol className="grid grid-cols-4 gap-2">
        {p.steps.map((s, i) => (
          <li key={s} className="text-center">
            <span
              className={cn(
                "mx-auto mb-2 grid size-8 place-items-center rounded-full text-xs font-bold",
                i < current ? "bg-teal text-white dark:text-[#0e1a20]" : i === current ? "bg-primary text-on-primary ring-4 ring-primary/15" : "bg-surface-2 text-muted",
              )}
            >
              {i < current ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className="text-[11px] leading-tight font-semibold text-muted">{s}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <CalendarDays className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted">{p.next}</p>
          <p className="text-sm font-bold">{p.nextValue}</p>
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-semibold">
          <span>{p.progress}</span>
          <span className="text-mint">68%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div className="animate-grow h-full w-[68%] rounded-full bg-teal" />
        </div>
      </div>
    </div>
  );
}

function SpecialistsPreview({ p }: { p: Exp["specialists"]["preview"] }) {
  const tones = ["bg-primary-soft text-primary", "bg-sun-soft text-sun-ink", "bg-blush-soft text-coral"];
  return (
    <div className="space-y-5">
      <p className="font-extrabold">{p.title}</p>
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {p.rows.map(([name, area, time], i) => (
          <li key={name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="font-semibold">{name}</span>
            <span className="flex items-center gap-3">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", tones[i])}>{area}</span>
              <span className="font-mono text-xs text-muted">{time}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="mb-3 text-xs font-bold tracking-wide text-muted uppercase">{p.plan}</p>
        <ul className="space-y-2">
          {p.goals.map((g, i) => (
            <li key={g} className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className={cn("size-4.5 shrink-0", i === 0 ? "text-mint" : "text-line")} />
              <span className={cn(i === 0 && "text-muted line-through")}>{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SchoolsPreview({ p }: { p: Exp["schools"]["preview"] }) {
  return (
    <div className="space-y-5">
      <p className="font-extrabold">{p.title}</p>
      <ul className="space-y-2.5">
        {p.items.map((it, i) => (
          <li key={it} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm">
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border-2", i < 2 ? "border-primary bg-primary text-on-primary" : "border-line")}>
              {i < 2 && <Check className="size-3" strokeWidth={3.5} />}
            </span>
            {it}
          </li>
        ))}
      </ul>
      <p className="rounded-xl bg-sun-soft px-3 py-2 text-xs font-semibold text-sun-ink">{p.note}</p>
    </div>
  );
}
