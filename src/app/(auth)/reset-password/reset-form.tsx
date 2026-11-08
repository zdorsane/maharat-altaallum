"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "../actions";
import { FormMessage, PasswordField, SubmitButton } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function ResetForm({ token, t, hint, common }: { token: string; t: Dict["auth"]["reset"]; hint: string; common: Dict["common"] }) {
  const [state, action] = useActionState(resetPasswordAction, null);
  const pw = { showLabel: common.showPassword, hideLabel: common.hidePassword };
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <PasswordField name="password" label={t.password} autoComplete="new-password" required state={state} hint={hint} {...pw} />
      <PasswordField name="confirm" label={t.confirm} autoComplete="new-password" required state={state} {...pw} />
      <SubmitButton className="btn-lg w-full">{t.submit}</SubmitButton>
    </form>
  );
}
