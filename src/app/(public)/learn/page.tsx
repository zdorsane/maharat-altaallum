import { getI18n } from "@/lib/i18n/server";
import { ArticleCard } from "@/components/article-card";
import { Disclaimer } from "@/components/ui";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.learn.title, description: t.learn.subtitle };
}

export default async function LearnPage() {
  const { t } = await getI18n();
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="eyebrow">
          <span className="h-0.5 w-6 rounded-full bg-sun" aria-hidden />
          {t.footer.resources}
        </p>
        <h1 className="text-display mt-3 text-primary">{t.learn.title}</h1>
        <p className="text-lead mt-4 text-muted">{t.learn.subtitle}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {t.articles.map((a, i) => (
          <ArticleCard key={a.slug} a={a} index={i} readLabel={t.learn.readMinutes} />
        ))}
      </div>
      <Disclaimer className="mt-12" />
    </main>
  );
}
