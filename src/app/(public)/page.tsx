import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Check, Ear, HeartHandshake, Lock, PencilLine, ShieldCheck, SpellCheck } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCard } from "@/components/article-card";
import { HeroArt } from "@/components/home/hero-art";
import { ReadingArt, SoundsArt, SpellingArt, WritingArt } from "@/components/home/area-art";
import { ExperienceTabs } from "@/components/home/experience-tabs";

const AREAS = [
  { Art: ReadingArt, Icon: BookOpen, panel: "bg-primary-soft", chip: "bg-primary text-on-primary" },
  { Art: WritingArt, Icon: PencilLine, panel: "bg-mint-soft", chip: "bg-teal text-[#283C48]" },
  { Art: SpellingArt, Icon: SpellCheck, panel: "bg-sun-soft", chip: "bg-sun text-[#283C48]" },
  { Art: SoundsArt, Icon: Ear, panel: "bg-blush-soft", chip: "bg-blush text-[#283C48]" },
];
const TRUST_ICONS = [BadgeCheck, Lock, HeartHandshake, ShieldCheck];

export default async function HomePage() {
  const { t } = await getI18n();
  const h = t.home;

  return (
    <main id="main" className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 -z-10 -mt-24 [mask-image:radial-gradient(ellipse_60%_55%_at_70%_35%,black,transparent)] rtl:[mask-image:radial-gradient(ellipse_60%_55%_at_30%_35%,black,transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-muted shadow-[var(--shadow-card)]">
              <span className="size-2 rounded-full bg-teal" />
              {h.badge}
            </p>
            <h1 className="text-display animate-fade-up mt-6 text-primary [animation-delay:80ms]">
              {h.titleStart} <span className="marker text-ink">{h.titleHighlight}</span> <span className="block text-ink/80 sm:inline">{h.titleEnd}</span>
            </h1>
            <p className="text-lead animate-fade-up mt-6 max-w-xl text-muted [animation-delay:160ms]">{h.subtitle}</p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/register" className="btn-primary btn-lg group">
                {h.ctaPrimary}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link href="/#how" className="btn-ghost btn-lg">
                {h.ctaSecondary}
              </Link>
            </div>
            <ul className="animate-fade-up mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-muted [animation-delay:320ms]">
              {h.heroPoints.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-mint-soft text-mint">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <HeroArt t={h.preview} />
        </div>
      </section>

      {/* ── Learning areas ───────────────────────────────── */}
      <section id="areas" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading eyebrow={h.areasEyebrow} title={h.areasTitle} subtitle={h.areasSubtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {h.areas.map((a, i) => {
            const { Art, Icon, panel, chip } = AREAS[i];
            return (
              <article key={a.title} className="reveal card card-hover group flex flex-col overflow-hidden p-0" style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <div className={cn("px-4 pt-5", panel)}>
                  <Art />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-9 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6", chip)}>
                      <Icon className="size-[18px]" />
                    </span>
                    <h3 className="text-xl font-extrabold">{a.title}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm text-muted">{a.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {a.tags.map((tag) => (
                      <li key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how" className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading eyebrow={h.howEyebrow} title={h.howTitle} subtitle={h.howSubtitle} />
          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {h.steps.map((s, i) => {
              const last = i === h.steps.length - 1;
              return (
                <li key={s.title} className="reveal relative flex gap-5 lg:block" style={{ "--d": `${i * 120}ms` } as React.CSSProperties}>
                  {!last && (
                    <span
                      aria-hidden
                      className="absolute start-6 top-14 -bottom-10 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--line)_0_6px,transparent_6px_12px)] lg:start-16 lg:end-0 lg:top-6 lg:bottom-auto lg:h-0.5 lg:w-auto lg:bg-[repeating-linear-gradient(to_right,var(--line)_0_6px,transparent_6px_12px)]"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold",
                      last ? "bg-sun text-[#283C48]" : "bg-primary text-on-primary",
                    )}
                  >
                    {i + 1}
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

      {/* ── Audiences ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <SectionHeading eyebrow={h.expEyebrow} title={h.expTitle} center />
        <div className="reveal">
          <ExperienceTabs
            data={h.experiences}
            note={h.previewNote}
            ctas={{ parents: t.nav.getStarted, specialists: t.specialistsPage.join, schools: h.experiences.schools.preview.cta }}
          />
        </div>
      </section>

      {/* ── Trust & safety ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-[#245B73] px-6 py-12 text-white sm:px-12 sm:py-16">
          <span aria-hidden className="absolute -end-16 -top-16 size-56 rounded-full bg-[#F3C969]/90" />
          <span aria-hidden className="absolute -start-10 -bottom-24 size-56 rounded-full border-[28px] border-[#67B7A5]/50" />
          <div className="relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#F3C969] uppercase">
                <span className="h-0.5 w-6 rounded-full bg-[#F3C969]" aria-hidden />
                {h.trustEyebrow}
              </p>
              <h2 className="text-h2 mt-3">{h.trustTitle}</h2>
              <p className="text-lead mt-4 text-white/80">{h.trustBody}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {h.trust.map((x, i) => {
                const Icon = TRUST_ICONS[i];
                return (
                  <li key={x.title} className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12]">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#F7F5EF] text-[#245B73]">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-extrabold">{x.title}</p>
                    <p className="mt-1.5 text-sm text-white/75">{x.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Resources ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow={h.resourcesEyebrow}
          title={h.resourcesTitle}
          subtitle={h.resourcesSubtitle}
          action={
            <Link href="/learn" className="btn-ghost group">
              {h.resourcesCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {t.articles.map((a, i) => (
            <ArticleCard key={a.slug} a={a} index={i} readLabel={t.learn.readMinutes} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-sun px-6 py-14 text-center text-[#283C48] sm:px-12">
          <span aria-hidden className="absolute -start-12 -top-12 size-40 rounded-full bg-[#F2A69B]/70" />
          <span aria-hidden className="absolute -end-8 -bottom-16 size-48 rounded-full border-[24px] border-[#245B73]/15" />
          <h2 className="text-h2 relative mx-auto max-w-2xl">{h.ctaTitle}</h2>
          <p className="text-lead relative mx-auto mt-4 max-w-xl text-[#283C48]/80">{h.ctaBody}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-lg group bg-[#245B73] text-white hover:bg-[#1b4a5e]">
              {h.ctaButton}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link href="/contact" className="btn btn-lg border-2 border-[#283C48]/20 text-[#283C48] hover:bg-white/40">
              {h.ctaContact}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
