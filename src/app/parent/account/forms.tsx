"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, updateAccountAction } from "./actions";
import { Field, FormMessage, PasswordField, Select, SubmitButton } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function AccountForm({
  t,
  values,
  wilayas,
}: {
  t: Dict["account"];
  values: { fullName: string; email: string; phone: string; wilaya: string };
  wilayas: [string, string][];
}) {
  const [state, action] = useActionState(updateAccountAction, null);
  const v = (k: "fullName" | "phone" | "wilaya") => String(state?.data?.[k] ?? values[k]);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field name="fullName" label={t.fullName} autoComplete="name" required state={state} defaultValue={v("fullName")} />
      <div>
        <label htmlFor="email" className="label">
          {t.email}
        </label>
        <input id="email" value={values.email} readOnly dir="ltr" className="field cursor-not-allowed bg-surface-2 text-muted" />
        <p className="mt-1.5 text-xs text-muted">{t.emailHint}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label={t.phone} type="tel" autoComplete="tel" dir="ltr" placeholder="0550123456" state={state} defaultValue={v("phone")} />
        <Select key={v("wilaya")} name="wilaya" label={t.wilaya} state={state} options={wilayas} defaultValue={v("wilaya")} required />
      </div>
      <SubmitButton pendingText={t.saving}>{t.save}</SubmitButton>
    </form>
  );
}

export function PasswordForm({ t, common, hint }: { t: Dict["account"]; common: Dict["common"]; hint: string }) {
  const [state, action] = useActionState(changePasswordAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const pw = { showLabel: common.showPassword, hideLabel: common.hidePassword };
  return (
    <form ref={ref} action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <PasswordField name="currentPassword" label={t.currentPassword} autoComplete="current-password" required state={state} {...pw} />
      <PasswordField name="password" label={t.newPassword} autoComplete="new-password" required state={state} hint={hint} {...pw} />
      <PasswordField name="confirm" label={t.confirm} autoComplete="new-password" required state={state} {...pw} />
      <SubmitButton pendingText={t.saving}>{t.changePassword}</SubmitButton>
    </form>
  );
}
