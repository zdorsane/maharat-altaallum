"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { Field, FormMessage, PasswordField, SubmitButton } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function LoginForm({ next, t, common }: { next?: string; t: Dict["auth"]["login"]; common: Dict["common"] }) {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field name="email" label={t.email} type="email" autoComplete="email" dir="ltr" required state={state} defaultValue={String(state?.data?.email ?? "")} />
      <div>
        <PasswordField name="password" label={t.password} autoComplete="current-password" required state={state} showLabel={common.showPassword} hideLabel={common.hidePassword} />
        <div className="mt-2 flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t.forgot}
          </Link>
        </div>
      </div>
      <SubmitButton className="btn-lg w-full" pendingText={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
