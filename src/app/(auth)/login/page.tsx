import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { LoginForm } from "./login-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.login.title };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, { t }] = await Promise.all([searchParams, getI18n()]);
  const l = t.auth.login;
  return (
    <>
      <h1 className="text-3xl font-bold">{l.title}</h1>
      <p className="mt-2 mb-8 text-muted">{l.subtitle}</p>
      <LoginForm next={next} t={l} common={t.common} />
      <p className="mt-8 text-center text-sm text-muted">
        {l.noAccount}{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          {l.createAccount}
        </Link>
      </p>
    </>
  );
}
