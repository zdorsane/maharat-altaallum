import { Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { ContactForm } from "./contact-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.contactPage.title, description: t.contactPage.subtitle };
}

export default async function ContactPage() {
  const { t } = await getI18n();
  const c = t.contactPage;
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">
            <span className="h-0.5 w-6 rounded-full bg-sun" aria-hidden />
            {t.nav.contact}
          </p>
          <h1 className="text-display mt-3 text-primary">{c.title}</h1>
          <p className="text-lead mt-4 text-muted">{c.subtitle}</p>
          <div className="mt-10 rounded-[1.5rem] bg-primary-soft p-6">
            <p className="font-extrabold text-primary">{c.asideTitle}</p>
            <ul className="mt-4 space-y-3">
              {c.asideItems.map((it) => (
                <li key={it} className="flex items-start gap-3 text-sm font-medium">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card rounded-[1.5rem] p-6 sm:p-8">
          <ContactForm t={c} />
        </div>
      </div>
    </main>
  );
}
