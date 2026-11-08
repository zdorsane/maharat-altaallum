import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Info } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { ArticleCard } from "@/components/article-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const [{ slug }, { t }] = await Promise.all([params, getI18n()]);
  const a = t.articles.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

/** Renders article paragraphs: "## " lines are headings, consecutive "- " lines form a list. */
function Body({ lines }: { lines: string[] }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-6 space-y-3">
        {list.map((li) => (
          <li key={li} className="flex gap-3">
            <span className="mt-2.5 size-2 shrink-0 rounded-full bg-sun" aria-hidden />
            <span>{li}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const line of lines) {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={line} className="mt-10 mb-3 text-2xl font-extrabold text-primary">
          {line.slice(3)}
        </h2>,
      );
    } else {
      blocks.push(
        <p key={line} className="my-4">
          {line}
        </p>,
      );
    }
  }
  flush();
  return <>{blocks}</>;
}

export default async function ArticlePage({ params }: Props) {
  const [{ slug }, { t }] = await Promise.all([params, getI18n()]);
  const index = t.articles.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const a = t.articles[index];
  const others = t.articles.filter((x) => x.slug !== slug);

  return (
    <main id="main" className="px-4 py-14">
      <article className="mx-auto max-w-2xl">
        <Link href="/learn" className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 rtl:group-hover:translate-x-0.5" />
          {t.learn.back}
        </Link>
        <p className="mt-8 text-xs font-bold tracking-wide text-primary uppercase">{a.category}</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">{a.title}</h1>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted">
          <Clock className="size-4" />
          {fmt(t.learn.readMinutes, { n: a.minutes })}
        </p>
        <div className="mt-8 h-1.5 w-20 rounded-full bg-sun" aria-hidden />
        <div className="text-lead mt-6 text-ink/90">
          <Body lines={a.body} />
        </div>
        <p className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {t.learn.note}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-soft p-6">
          <p className="text-lg font-extrabold text-primary">{t.learn.ctaTitle}</p>
          <Link href="/register" className="btn-primary">
            {t.learn.ctaButton}
          </Link>
        </div>
      </article>

      <section className="mx-auto mt-20 max-w-6xl">
        <h2 className="mb-8 text-2xl font-extrabold">{t.learn.related}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {others.map((o) => (
            <ArticleCard key={o.slug} a={o} index={t.articles.indexOf(o)} readLabel={t.learn.readMinutes} />
          ))}
        </div>
      </section>
    </main>
  );
}
