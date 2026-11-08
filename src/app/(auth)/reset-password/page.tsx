import { getI18n } from "@/lib/i18n/server";
import { ResetForm } from "./reset-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.reset.title };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ token }, { t }] = await Promise.all([searchParams, getI18n()]);
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">{t.auth.reset.title}</h1>
      <ResetForm token={token ?? ""} t={t.auth.reset} hint={t.auth.register.passwordHint} common={t.common} />
    </>
  );
}
