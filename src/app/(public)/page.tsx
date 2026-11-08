import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Ear,
  GraduationCap,
  HeartHandshake,
  LineChart,
  MessagesSquare,
  PencilLine,
  Puzzle,
  Smile,
  Sparkles,
  SpellCheck,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { getI18n, type Dict } from "@/lib/i18n/server";
import { cn, initials } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { HeroArt } from "@/components/home/hero-art";
import { ReadingArt, SoundsArt, SpellingArt, WritingArt } from "@/components/home/area-art";
import { GoldStar, Sparkle } from "@/components/brand/decor";
import { Disclaimer } from "@/components/ui";
import { CountUp, Parallax } from "@/components/motion";
import { Words, wordCount } from "@/components/words";

const AREAS = [
  { Art: ReadingArt, Icon: BookOpen, panel: "bg-primary-soft", chip: "bg-primary text-on-primary" },
  { Art: WritingArt, Icon: PencilLine, panel: "bg-violet-soft", chip: "bg-teal text-[#29204D]" },
  { Art: SpellingArt, Icon: SpellCheck, panel: "bg-sun-soft", chip: "bg-sun text-[#29204D]" },
  { Art: SoundsArt, Icon: Ear, panel: "bg-blush-soft", chip: "bg-blush text-[#29204D]" },
];
const PROGRAM_ICONS = [BookOpen, PencilLine, SpellCheck, Puzzle, Sparkles];
const SPEC_ICONS = [Award, Compass, LineChart, MessagesSquare];
const WHY = [
  { Icon: HeartHandshake, tone: "bg-primary-soft text-primary" },
  { Icon: GraduationCap, tone: "bg-violet-soft text-violet" },
  { Icon: Smile, tone: "bg-sun-soft text-sun-ink" },
  { Icon: TrendingUp, tone: "bg-blush-soft text-primary" },
];

const arrow = "size-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1";
const delay = (i: number, step = 90) => ({ "--d": `${i * step}ms` }) as React.CSSProperties;

export default async function HomePage() {
  const { t } = await getI18n();
  const h = t.home;
  // Only real, public, non-demo specialist profiles are ever shown.
  const specialists = await db.specialist.findMany({ where: { isPublic: true, isDemo: false }, take: 3, orderBy: { createdAt: "asc" } });

  return (
    <main id="main" className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[46rem] bg-[radial-gradient(ellipse_70%_60%_at_80%_20%,rgb(167_139_250/0.22),transparent_70%),radial-gradient(ellipse_50%_50%_at_10%_70%,rgb(96_181_245/0.14),transparent_70%)] rtl:bg-[radial-gradient(ellipse_70%_60%_at_20%_20%,rgb(167_139_250/0.22),transparent_70%),radial-gradient(ellipse_50%_50%_at_90%_70%,rgb(96_181_245/0.14),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:pb-24">
          <div>
            <p className="animate-fade-up flex flex-wrap items-center gap-x-2 text-sm font-bold text-primary">
              {h.motto.map((m, i) => (
                <span key={m} className="inline-flex items-center gap-2">
                  {i > 0 && <span className="size-1.5 rounded-full bg-sun" aria-hidden />}
                  {m}
                </span>
              ))}
            </p>
            <h1 className="text-display mt-5 text-ink">
              <Words text={h.titleStart} /> <span className="marker text-primary"><Words text={h.titleHighlight} start={wordCount(h.titleStart)} /></span>{" "}
              <Words text={h.titleEnd} start={wordCount(h.titleStart) + wordCount(h.titleHighlight)} />
            </h1>
            <p className="text-lead animate-fade-up mt-6 max-w-xl text-muted [animation-delay:160ms]">{h.subtitle}</p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/register" className="btn-primary btn-lg group">
                {h.ctaPrimary}
                <ArrowRight className={arrow} />
              </Link>
              <Link href="/#programs" className="btn-ghost btn-lg">
                {h.ctaSecondary}
              </Link>
            </div>
            <ul className="animate-fade-up mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-muted [animation-delay:320ms]">
              {h.heroPoints.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-primary-soft text-primary">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <Parallax>
            <HeroArt t={h.preview} />
          </Parallax>
        </div>
      </section>

      {/* ── Learning difficulties ────────────────────────── */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading eyebrow={h.areasEyebrow} title={h.areasTitle} subtitle={h.areasSubtitle} />
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {h.areas.map((a, i) => {
            const { Art, Icon, panel, chip } = AREAS[i];
            return (
              <article key={a.title} className="reveal card card-hover spotlight group flex flex-col overflow-hidden rounded-[1.75rem] p-0" style={delay(i)}>
                <div className={cn("px-4 pt-5", panel)}>
                  <Art />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6", chip)}>
                      <Icon className="size-[18px]" />
                    </span>
                    <h3 className="text-lg leading-snug font-extrabold">{a.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted">{a.body}</p>
                  <details className="group/more mt-4">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full text-sm font-bold text-primary [&::-webkit-details-marker]:hidden">
                      <span className="group-open/more:hidden">{h.learnMore}</span>
                      <span className="hidden group-open/more:inline">{h.showLess}</span>
                      <ChevronDown className="size-4 transition-transform group-open/more:rotate-180" />
                    </summary>
                    <ul className="animate-fade-in mt-3 space-y-2 border-t border-line pt-3 text-sm">
                      {a.more.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sun" aria-hidden />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── How AFAQ works ───────────────────────────────── */}
      <section id="how" className="relative overflow-hidden bg-surface-2">
        <Sparkle className="absolute end-[8%] top-10 w-5 opacity-70" />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading eyebrow={h.howEyebrow} title={h.howTitle} subtitle={h.howSubtitle} />
          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {h.steps.map((s, i) => {
              const last = i === h.steps.length - 1;
              return (
                <li key={s.title} className="reveal relative flex gap-5 lg:block" style={delay(i, 120)}>
                  {!last && (
                    <span
                      aria-hidden
                      className="line-draw absolute start-7 top-16 -bottom-10 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--blush)_0_6px,transparent_6px_12px)] lg:start-[4.5rem] lg:end-0 lg:top-7 lg:bottom-auto lg:h-0.5 lg:w-auto lg:bg-[repeating-linear-gradient(to_right,var(--blush)_0_6px,transparent_6px_12px)]"
                    />
                  )}
                  <span
                    className={cn(
                      "pop-on-reveal relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold shadow-[var(--shadow-card)]",
                      last ? "bg-sun text-[#29204D]" : "bg-primary text-on-primary",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="lg:mt-6 lg:pe-4">
                    <h3 className="text-lg font-extrabold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Programs ─────────────────────────────────────── */}
      <section id="programs" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading eyebrow={h.programsEyebrow} title={h.programsTitle} subtitle={h.programsSubtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {h.programs.map((p, i) => {
            const Icon = PROGRAM_ICONS[i];
            const soon = i >= 3;
            return (
              <article
                key={p.title}
                style={delay(i)}
                className={cn(
                  "reveal card card-hover spotlight relative flex flex-col overflow-hidden rounded-[1.75rem] p-6",
                  i < 3 ? "lg:col-span-2" : "lg:col-span-3",
                  soon && "border-dashed bg-surface-2/60 shadow-none",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("grid size-12 place-items-center rounded-2xl", soon ? "bg-surface text-muted" : "bg-primary text-on-primary")}>
                    <Icon className="size-6" />
                  </span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", soon ? "bg-sun-soft text-sun-ink" : "bg-primary-soft text-primary")}>
                    {soon ? h.statusSoon : h.statusAvailable}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Specialists ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div data-reveal="scale" className="reveal grid gap-10 rounded-[2rem] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={h.specEyebrow} title={h.specTitle} subtitle={h.specSubtitle} className="mb-8" />
            <Link href="/specialists" className="btn-primary group">
              {h.specCta}
              <ArrowRight className={arrow} />
            </Link>
          </div>
          {specialists.length > 0 ? (
            <ul className="grid gap-4">
              {specialists.map((s) => (
                <li key={s.id} className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary font-extrabold text-on-primary">{initials(s.displayName)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">{s.displayName}</p>
                    <p className="truncate text-sm text-muted">{t.labels.specializations[s.specialization as keyof typeof t.labels.specializations] ?? s.title}</p>
                  </div>
                  <BadgeCheck className="size-5 shrink-0 text-mint" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="reveal-stagger grid gap-4 sm:grid-cols-2">
              {h.specFeatures.map((f, i) => {
                const Icon = SPEC_ICONS[i];
                return (
                  <li key={f.title} className="rounded-2xl bg-surface-2 p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-surface text-primary shadow-[var(--shadow-card)]">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-extrabold">{f.title}</p>
                    <p className="mt-1 text-sm text-muted">{f.body}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Parent experience ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow={h.parentEyebrow} title={h.parentTitle} subtitle={h.parentSubtitle} className="mb-8" />
            <ul className="reveal-stagger space-y-3">
              {h.parentPoints.map((p) => (
                <li key={p} className="flex items-center gap-3 font-semibold">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary group mt-8">
              {t.nav.getStarted}
              <ArrowRight className={arrow} />
            </Link>
          </div>
          <ParentPreview h={h} />
        </div>
      </section>

      {/* ── Why AFAQ ─────────────────────────────────────── */}
      <section className="bg-surface-2">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading eyebrow={h.whyEyebrow} title={h.whyTitle} center />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.why.map((w, i) => {
              const { Icon, tone } = WHY[i];
              return (
                <article key={w.title} className="reveal card card-hover spotlight overflow-hidden rounded-[1.75rem] p-6 text-center" style={delay(i)}>
                  <span className={cn("pop-on-reveal mx-auto grid size-14 place-items-center rounded-2xl", tone)}>
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted">{w.body}</p>
                </article>
              );
            })}
          </div>
          <Disclaimer className="reveal mx-auto mt-10 max-w-3xl" />
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div data-reveal="scale" className="reveal relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#4B2CBF_0%,#3A2399_55%,#29204D_100%)] px-6 py-16 text-center text-white sm:px-12">
          <svg aria-hidden viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-32 w-full opacity-40">
            <path d="M0 160C180 90 360 80 520 120S760 170 800 140V200H0Z" fill="#A78BFA" />
            <path d="M0 190C220 130 420 140 600 170S760 190 800 180V200H0Z" fill="#60B5F5" opacity=".6" />
          </svg>
          <GoldStar className="animate-float absolute start-[8%] top-10 w-10" />
          <GoldStar className="animate-float absolute end-[10%] top-16 w-6 [animation-delay:-3s]" />
          <Sparkle className="animate-twinkle absolute end-[22%] bottom-20 w-4" color="#F6B94D" />
          <Sparkle className="animate-twinkle absolute start-[20%] bottom-16 w-3 [animation-delay:-1s]" color="#ffffff" />
          <h2 className="text-h2 relative mx-auto max-w-2xl">{h.finalTitle}</h2>
          <p className="text-lead relative mx-auto mt-4 max-w-xl text-white/80">{h.finalBody}</p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-sun btn-lg group">
              {h.finalCta}
              <ArrowRight className={arrow} />
            </Link>
            <Link href="/contact" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">
              {h.finalSecondary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ParentPreview({ h }: { h: Dict["home"] }) {
  const p = h.parentPreview;
  return (
    <div data-reveal="end" className="reveal relative">
      <div aria-hidden className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[linear-gradient(135deg,#EDE6FF,#E3F2FE)] dark:opacity-20" />
      <GoldStar className="animate-float absolute -end-3 -top-4 w-10" />
      <div className="card rounded-[1.75rem] p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-sun text-lg font-extrabold text-[#29204D]">{p.child.charAt(0)}</span>
            <div>
              <p className="font-extrabold">{p.child}</p>
              <p className="text-xs text-muted">{p.level}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">{h.previewNote}</span>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-2 p-4">
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span>{p.progress}</span>
            <span className="text-primary"><CountUp value={72} suffix="%" /></span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface">
            <div className="animate-grow h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#4B2CBF,#A78BFA)]" />
          </div>
          <div className="mt-4 flex h-16 items-end gap-2" aria-hidden>
            {[30, 42, 38, 55, 61, 72].map((v, i) => (
              <span
                key={i}
                className={cn("animate-rise flex-1 origin-bottom rounded-md", i === 5 ? "bg-sun" : "bg-blush/70")}
                style={{ height: `${v}%`, animationDelay: `${600 + i * 90}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-4">
            <p className="mb-2 text-xs font-bold text-muted uppercase">{p.recTitle}</p>
            <ul className="space-y-2 text-sm">
              {p.recs.map((r) => (
                <li key={r} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-on-primary">
              <CalendarDays className="size-5 shrink-0" />
              <div>
                <p className="text-xs opacity-80">{p.apptTitle}</p>
                <p className="text-sm font-bold">{p.appt}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-line p-4">
              <span className="text-sm font-bold">{p.actTitle}</span>
              <span className="rounded-full bg-sun-soft px-2 py-0.5 text-xs font-bold text-sun-ink">{p.soon}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
