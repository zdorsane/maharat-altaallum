"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";
import { Field, FormMessage, PasswordField, Select, SubmitButton } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function RegisterForm({ t, common, wilayas }: { t: Dict["auth"]["register"]; common: Dict["common"]; wilayas: [string, string][] }) {
  const [state, action] = useActionState(registerAction, null);
  const kept = (k: string) => String(state?.data?.[k] ?? "");
  const pw = { showLabel: common.showPassword, hideLabel: common.hidePassword };
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field name="fullName" label={t.fullName} autoComplete="name" required state={state} defaultValue={kept("fullName")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" label={t.email} type="email" autoComplete="email" dir="ltr" required state={state} defaultValue={kept("email")} />
        <Field name="phone" label={t.phone} type="tel" autoComplete="tel" dir="ltr" placeholder="0550123456" state={state} defaultValue={kept("phone")} />
      </div>
      <Select name="wilaya" label={t.wilaya} state={state} placeholder={t.wilayaPlaceholder} required options={wilayas} defaultValue={kept("wilaya")} key={kept("wilaya")} />
      <PasswordField name="password" label={t.password} autoComplete="new-password" required state={state} hint={t.passwordHint} {...pw} />
      <PasswordField name="confirm" label={t.confirm} autoComplete="new-password" required state={state} {...pw} />
      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3 text-sm transition hover:border-primary/40">
          <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" />
          <span className="text-muted">
            {t.consentBefore}{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-primary underline">
              {t.consentLink}
            </Link>{" "}
            {t.consentAfter}
          </span>
        </label>
        {state?.errors?.consent && <p className="field-error">{state.errors.consent}</p>}
      </div>
      <SubmitButton className="btn-lg w-full" pendingText={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
