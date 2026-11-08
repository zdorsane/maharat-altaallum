import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { ForgotForm } from "./forgot-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.forgot.title };
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();
  const f = t.auth.forgot;
  return (
    <>
      <h1 className="text-3xl font-bold">{f.title}</h1>
      <p className="mt-2 mb-8 text-muted">{f.subtitle}</p>
      <ForgotForm t={f} />
      <p className="mt-8 text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {f.back}
        </Link>
      </p>
    </>
  );
}
