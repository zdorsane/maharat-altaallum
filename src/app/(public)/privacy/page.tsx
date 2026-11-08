import { ShieldCheck } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.privacy.title };
}

export default async function PrivacyPage() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <ShieldCheck className="size-7" />
      </span>
      <h1 className="mt-5 mb-10 text-4xl font-bold">{t.privacy.title}</h1>
      <div className="space-y-4">
        {t.privacy.sections.map((s, i) => (
          <section key={s.title} className="reveal card" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <p className="leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
