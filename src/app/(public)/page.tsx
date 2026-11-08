import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  Check,
  ClipboardList,
  Ear,
  GraduationCap,
  HeartHandshake,
  Lock,
  PencilLine,
  School,
  Sparkles,
  SpellCheck,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { getI18n, type Dict } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const AREA_STYLE = [
  { icon: BookOpen, tile: "bg-primary-soft text-primary", glow: "from-primary/20" },
  { icon: PencilLine, tile: "bg-mint-soft text-mint", glow: "from-mint/20" },
  { icon: SpellCheck, tile: "bg-sun-soft text-sun-ink", glow: "from-sun/25" },
  { icon: Ear, tile: "bg-violet-soft text-violet", glow: "from-violet/20" },
];
const STEP_ICONS = [ClipboardList, UserCheck, HeartHandshake, Sparkles];
const AUDIENCE = [
  { icon: Users, href: "/register" },
  { icon: Stethoscope, href: "/contact" },
  { icon: School, href: "/contact" },
];
const TRUST_ICONS = [GraduationCap, BadgeCheck, Lock];

function SectionHead({ eyebrow, title, subtitle, center = false }: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn("reveal mb-12 max-w-2xl", center && "mx-auto text-center")}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
    </div>
  );
}

function HeroVisual({ t }: { t: Dict["home"]["preview"] }) {
  const letters = ["ت", "ب", "ث", "ن", "ي", "ف"];
  const bars = [38, 52, 47, 66, 74, 88];
  return (
    <div className="animate-fade-up relative mx-auto aspect-[1/1.02] w-full max-w-[30rem] [animation-delay:250ms]" aria-hidden>
      <div className="absolute inset-8 rotate-6 rounded-[2.5rem] bg-linear-to-br from-primary to-teal opacity-90 blur-[2px]" />
      <div className="absolute inset-8 -rotate-3 rounded-[2.5rem] border border-line bg-surface p-6 shadow-[0_40px_80px_-30px_rgb(36_72_224/0.45)]">
        <span className="block pe-24 text-sm font-semibold sm:pe-28">{t.exercise}</span>
        <div className="mt-6 grid grid-cols-3 gap-3" dir="rtl">
          {letters.map((l, i) => (
            <div
              key={i}
              className={cn(
                "grid aspect-square place-items-center rounded-2xl border font-[family-name:var(--font-display)] text-4xl font-bold",
                l === "ب" ? "animate-pop border-mint bg-mint-soft text-mint ring-4 ring-mint/15" : "border-line bg-surface-2 text-ink/75",
              )}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div className="animate-grow h-full w-2/3 rounded-full bg-linear-to-r from-primary to-teal" />
        </div>
        <p className="mt-3 text-end text-[10px] text-muted">{t.example}</p>
      </div>

      <div className="animate-float absolute -end-2 top-0 w-44 rounded-2xl border border-line bg-surface p-4 shadow-xl sm:-end-6">
        <p className="text-xs font-semibold">{t.progress}</p>
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%`, animationDelay: `${700 + i * 90}ms` }}
              className={cn("animate-rise flex-1 origin-bottom rounded-md", i === bars.length - 1 ? "bg-teal" : "bg-primary/70")}
            />
          ))}
        </div>
      </div>

      <div className="animate-float absolute start-0 bottom-2 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 pe-4 shadow-xl [animation-delay:-3.5s] sm:-start-6">
        <span className="grid size-10 place-items-center rounded-xl bg-mint-soft text-mint">
          <CalendarCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold">{t.appointment}</p>
          <p className="text-[11px] text-muted">{t.appointmentSub}</p>
        </div>
      </div>

      <Sparkles className="animate-twinkle absolute start-10 top-4 size-6 text-sun" />
    </div>
  );
}

export default async function HomePage() {
  const { t } = await getI18n();
  const h = t.home;

  return (
    <main className="overflow-x-clip">
      {/* Hero */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 -mt-24">
          <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
          <div className="animate-blob absolute -top-10 start-[5%] size-[30rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="animate-blob absolute top-40 end-[0%] size-[26rem] rounded-full bg-teal/20 blur-3xl [animation-delay:-7s]" />
          <div className="animate-blob absolute bottom-0 start-1/3 size-[20rem] rounded-full bg-sun/15 blur-3xl [animation-delay:-14s]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-28">
          <div>
            <p className="animate-fade-up glass inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-mint" />
              </span>
              {h.badge}
            </p>
            <h1 className="animate-fade-up mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl [animation-delay:80ms]">
              {h.titleStart}{" "}
              <span className="relative inline-block">
                <span className="text-gradient">{h.titleHighlight}</span>
                <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1 h-3 w-full text-sun" aria-hidden>
                  <path d="M3 8.5C50 3 140 2 197 6.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="260" className="animate-draw" />
                </svg>
              </span>{" "}
              {h.titleEnd}
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted [animation-delay:160ms]">{h.subtitle}</p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/register" className="btn-primary btn-lg group">
                {h.ctaPrimary}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link href="/#how" className="btn-ghost btn-lg">
                {h.ctaSecondary}
              </Link>
            </div>
            <ul className="animate-fade-up mt-10 grid gap-x-6 gap-y-2.5 text-sm text-muted sm:grid-cols-2 [animation-delay:320ms]">
              {h.pills.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-mint-soft text-mint">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual t={h.preview} />
        </div>
      </section>

      {/* Areas — bento */}
      <section id="areas" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20">
        <SectionHead eyebrow={h.areasEyebrow} title={h.areasTitle} subtitle={h.areasSubtitle} />
        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {h.areas.map((a, i) => {
            const s = AREA_STYLE[i];
            const big = i === 0;
            return (
              <article
                key={a.title}
                style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
                className={cn(
                  "reveal card card-hover group relative overflow-hidden p-7",
                  big && "md:col-span-2 md:row-span-2",
                  i === 1 && "md:col-span-2",
                )}
              >
                <div className={cn("pointer-events-none absolute -end-16 -bottom-16 size-56 rounded-full bg-radial to-transparent blur-2xl transition-transform duration-700 group-hover:scale-125", s.glow)} />
                <span className={cn("relative grid size-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6", s.tile)}>
                  <s.icon className="size-7" />
                </span>
                <h3 className={cn("relative mt-5 font-bold", big ? "text-3xl" : "text-xl")}>{a.title}</h3>
                <p className={cn("relative mt-2 text-muted", big && "max-w-sm text-lg")}>{a.body}</p>
                {big && (
                  <p aria-hidden dir="rtl" className="pointer-events-none relative mt-10 font-[family-name:var(--font-display)] text-7xl font-bold tracking-widest text-primary/10 select-none">
                    أ ب ت ث
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20">
        <SectionHead eyebrow={h.howEyebrow} title={h.howTitle} subtitle={h.howSubtitle} />
        <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden className="absolute inset-x-12 top-7 hidden h-px bg-linear-to-r from-transparent via-line to-transparent lg:block" />
          {h.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={s.title} className="reveal relative" style={{ "--d": `${i * 110}ms` } as React.CSSProperties}>
                <div className="relative z-10 mb-5 flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-primary to-teal text-white shadow-[0_12px_24px_-12px_rgb(36_72_224/0.8)]">
                    <Icon className="size-6" />
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-line">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Audience */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHead eyebrow={h.audienceEyebrow} title={h.audienceTitle} center />
        <div className="grid gap-5 md:grid-cols-3">
          {h.audience.map((a, i) => {
            const { icon: Icon, href } = AUDIENCE[i];
            return (
              <article key={a.title} className="reveal card card-hover group flex flex-col p-7" style={{ "--d": `${i * 100}ms` } as React.CSSProperties}>
                <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-primary transition group-hover:bg-primary group-hover:text-on-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
                <p className="mt-2 flex-1 text-muted">{a.body}</p>
                <Link href={href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {a.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-[#0b1430] via-[#0f1d45] to-[#0b2c3a] p-8 text-white sm:p-12">
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-20" />
          <div aria-hidden className="animate-blob pointer-events-none absolute -end-20 -top-20 size-80 rounded-full bg-[#2448e0]/40 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">{h.trustEyebrow}</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{h.trustTitle}</h2>
              <p className="mt-3 text-white/70">{h.trustBody}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {h.trust.map((x, i) => {
                const Icon = TRUST_ICONS[i];
                return (
                  <li key={x.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10">
                    <Icon className="size-6 text-[#7fe3d4]" />
                    <p className="mt-3 font-semibold">{x.title}</p>
                    <p className="mt-1.5 text-sm text-white/65">{x.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#2448e0] via-[#2a5cf0] to-[#0fb3a0] px-8 py-14 text-center text-white">
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
          <h2 className="relative text-3xl font-bold sm:text-4xl">{h.ctaTitle}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">{h.ctaBody}</p>
          <Link href="/register" className="btn btn-lg group relative mt-8 bg-white text-[#1c3bc2] shadow-xl hover:-translate-y-0.5">
            {h.ctaButton}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
