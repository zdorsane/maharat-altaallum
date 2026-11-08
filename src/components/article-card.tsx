import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const COVERS = [
  { bg: "bg-primary-soft", shape: "bg-primary", letter: "text-primary/15", glyph: "ق" },
  { bg: "bg-sun-soft", shape: "bg-sun", letter: "text-sun-ink/15", glyph: "ب" },
  { bg: "bg-blush-soft", shape: "bg-blush", letter: "text-coral/15", glyph: "Aa" },
];

export type ArticleSummary = { slug: string; category: string; minutes: number; title: string; excerpt: string };

/** Editorial article card with a typographic cover (no stock imagery needed). */
export function ArticleCard({ a, index, readLabel, className }: { a: ArticleSummary; index: number; readLabel: string; className?: string }) {
  const c = COVERS[index % COVERS.length];
  return (
    <article className={cn("reveal card card-hover group relative flex flex-col overflow-hidden p-0", className)} style={{ "--d": `${index * 90}ms` } as React.CSSProperties}>
      <div className={cn("relative h-40 overflow-hidden", c.bg)} aria-hidden>
        <span className={cn("absolute -bottom-10 -start-6 size-32 rounded-full opacity-80 transition-transform duration-700 group-hover:scale-110", c.shape)} />
        <span className="absolute end-6 top-6 size-6 rounded-md bg-surface/70 rotate-12" />
        <span className={cn("absolute end-5 bottom-0 text-[7rem] leading-none font-extrabold select-none", c.letter)}>{c.glyph}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold tracking-wide text-primary uppercase">{a.category}</p>
        <h3 className="mt-2 text-lg leading-snug font-extrabold">
          <Link href={`/learn/${a.slug}`} className="after:absolute after:inset-0">
            {a.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted">{a.excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {fmt(readLabel, { n: a.minutes })}
          </span>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>
      </div>
    </article>
  );
}
