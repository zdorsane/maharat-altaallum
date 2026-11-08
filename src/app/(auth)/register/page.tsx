import Link from "next/link";
import { WILAYAS } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";
import { RegisterForm } from "./register-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.register.title };
}

export default async function RegisterPage() {
  const { t, locale } = await getI18n();
  const r = t.auth.register;
  const wilayas = WILAYAS.map(([code, ar, latin]) => [code, `${code} — ${locale === "ar" ? ar : latin}`] as [string, string]);
  return (
    <>
      <h1 className="text-3xl font-bold">{r.title}</h1>
      <p className="mt-2 mb-8 text-muted">{r.subtitle}</p>
      <RegisterForm t={r} common={t.common} wilayas={wilayas} />
      <p className="mt-8 text-center text-sm text-muted">
        {r.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {r.login}
        </Link>
      </p>
    </>
  );
}
