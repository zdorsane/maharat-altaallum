"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "../actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function ForgotForm({ t }: { t: Dict["auth"]["forgot"] }) {
  const [state, action] = useActionState(forgotPasswordAction, null);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <Field name="email" label={t.email} type="email" autoComplete="email" dir="ltr" required state={state} />
      <SubmitButton className="btn-lg w-full">{t.submit}</SubmitButton>
    </form>
  );
}
